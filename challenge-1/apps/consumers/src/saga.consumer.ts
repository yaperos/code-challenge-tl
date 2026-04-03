import { Controller, Logger, Inject } from '@nestjs/common';
import { EventPattern, Payload, ClientKafka } from '@nestjs/microservices';
import { DataSource } from 'typeorm';
import { ProcessedEventsRepository } from './processed-events.repository';
import { Payment, PaymentStatus } from '@app/shared';

@Controller()
export class SagaConsumer {
  private readonly logger = new Logger(SagaConsumer.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly processedRepo: ProcessedEventsRepository,
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka,
  ) {}

  @EventPattern([
    'pe.payment.fraud.approved.v1',
    'mx.payment.fraud.approved.v1',
    'co.payment.fraud.approved.v1',
    'gen.payment.fraud.approved.v1'
  ])
  async handleFraudApproved(@Payload() message: any): Promise<void> {
    const aggregateId = message.aggregateId || message.id;
    await this.trySettlePayment(message.eventId, aggregateId);
  }

  @EventPattern([
    'pe.payment.ledger.written.v1',
    'mx.payment.ledger.written.v1',
    'co.payment.ledger.written.v1',
    'gen.payment.ledger.written.v1'
  ])
  async handleLedgerWritten(@Payload() message: any): Promise<void> {
    const aggregateId = message.aggregateId || message.id;
    await this.trySettlePayment(message.eventId, aggregateId);
  }

  @EventPattern([
    'pe.payment.failed.v1',
    'mx.payment.failed.v1',
    'co.payment.failed.v1',
    'gen.payment.failed.v1'
  ])
  async handlePaymentFailed(@Payload() message: any): Promise<void> {
    const aggregateId = message.aggregateId || message.id;
    this.logger.warn(`Saga picking up failure for payment ${aggregateId}`);
    
    // Atomically update DB to FAILED. If already updated, it won't trigger again.
    await this.dataSource.manager.update(
      Payment, 
      { id: aggregateId, status: PaymentStatus.PENDING }, 
      { status: PaymentStatus.FAILED }
    );
  }

  private async trySettlePayment(eventId: string, aggregateId: string): Promise<void> {
    if (!eventId || !aggregateId) return;

    // Check if both Fraud and Ledger processed
    const fraudProcessed = await this.processedRepo.exists(eventId, 'FraudConsumer');
    const ledgerProcessed = await this.processedRepo.exists(eventId, 'LedgerConsumer');

    if (fraudProcessed && ledgerProcessed) {
      // Use a conditional update to ensure only one process settles the payment
      const result = await this.dataSource.manager.update(
        Payment, 
        { id: aggregateId, status: PaymentStatus.PENDING }, 
        { status: PaymentStatus.SETTLED }
      );

      // Only proceed if we actually updated the status (first one to arrive)
      if (result.affected && result.affected > 0) {
        this.logger.log(`Both consumers processed for ${aggregateId}. Settling payment.`);
        
        const payment = await this.dataSource.manager.findOne(Payment, { where: { id: aggregateId } });
        if (payment) {
          const countryPrefix = (payment.country || 'gen').toLowerCase();
          this.logger.log(`Emitting success event for ${aggregateId} to ${countryPrefix}.payment.settled.v1`);
          
          this.kafkaClient.emit(`${countryPrefix}.payment.settled.v1`, {
            key: aggregateId,
            value: { 
              aggregateId, 
              eventId, 
              status: 'SETTLED',
              amount: payment.amount,
              currency: payment.currency
            }
          });
        }
      } else {
        this.logger.debug(`Payment ${aggregateId} already settled or not in PENDING state.`);
      }
    }
  }
}

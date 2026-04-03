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
    const eventId = message.eventId || message.id;
    
    // Idempotency check for SagaConsumer itself processing THIS specific message
    const alreadyProcessed = await this.processedRepo.exists(eventId, 'SagaConsumer_Fraud');
    if (alreadyProcessed) return;

    await this.processedRepo.markProcessed(eventId, 'SagaConsumer_Fraud');
    await this.trySettlePayment(eventId, aggregateId);
  }

  @EventPattern([
    'pe.payment.ledger.written.v1',
    'mx.payment.ledger.written.v1',
    'co.payment.ledger.written.v1',
    'gen.payment.ledger.written.v1'
  ])
  async handleLedgerWritten(@Payload() message: any): Promise<void> {
    const aggregateId = message.aggregateId || message.id;
    const eventId = message.eventId || message.id;

    // Idempotency check for SagaConsumer itself processing THIS specific message
    const alreadyProcessed = await this.processedRepo.exists(eventId, 'SagaConsumer_Ledger');
    if (alreadyProcessed) return;

    await this.processedRepo.markProcessed(eventId, 'SagaConsumer_Ledger');
    await this.trySettlePayment(eventId, aggregateId);
  }

  @EventPattern([
    'pe.payment.failed.v1',
    'mx.payment.failed.v1',
    'co.payment.failed.v1',
    'gen.payment.failed.v1'
  ])
  async handlePaymentFailed(@Payload() message: any): Promise<void> {
    const aggregateId = message.aggregateId || message.id;
    const eventId = message.eventId || message.id;

    if (!eventId) {
      this.logger.error(`Saga received failure for payment ${aggregateId} but no eventId was found in the message! Cannot mark idempotency.`);
      // Still update the payment status to FAILED for consistency, but skip idempotency registration
      await this.dataSource.manager.update(
        Payment, 
        { id: aggregateId, status: PaymentStatus.PENDING }, 
        { status: PaymentStatus.FAILED }
      );
      return;
    }

    const alreadyProcessed = await this.processedRepo.exists(eventId, 'SagaConsumer_Failed');
    if (alreadyProcessed) return;

    this.logger.warn(`Saga picking up failure for payment ${aggregateId}`);
    await this.processedRepo.markProcessed(eventId, 'SagaConsumer_Failed');
    
    // Atomically update DB to FAILED.
    await this.dataSource.manager.update(
      Payment, 
      { id: aggregateId, status: PaymentStatus.PENDING }, 
      { status: PaymentStatus.FAILED }
    );
  }

  private async trySettlePayment(eventId: string, aggregateId: string): Promise<void> {
    if (!eventId || !aggregateId) return;

    // Check if both Fraud and Ledger processed for the ORIGINAL event
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
          
          try {
            await this.kafkaClient.emit(`${countryPrefix}.payment.settled.v1`, {
              key: aggregateId,
              value: { 
                aggregateId, 
                eventId, 
                status: 'SETTLED',
                amount: payment.amount,
                currency: payment.currency
              }
            }).toPromise();
          } catch (error) {
            this.logger.error(`Failed to emit settled event for ${aggregateId}: ${error.message}`);
            // In a real production app, we would use an outbox here too or a retry mechanism
          }
        }
      } else {
        // Silencing or reducing prominence of this log as it's an expected race condition
        this.logger.debug(`Payment ${aggregateId} reached settlement condition but was already processed.`);
      }
    }
  }
}

import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { DataSource } from 'typeorm';
import { ProcessedEventsRepository } from './processed-events.repository';
import { Payment, PaymentStatus } from '@app/shared';

@Controller()
export class SagaConsumer {
  private readonly logger = new Logger(SagaConsumer.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly processedRepo: ProcessedEventsRepository,
  ) {}

  @EventPattern('payment.fraud.approved.v1')
  async handleFraudApproved(@Payload() message: any): Promise<void> {
    await this.trySettlePayment(message.eventId, message.aggregateId);
  }

  @EventPattern('payment.ledger.written.v1')
  async handleLedgerWritten(@Payload() message: any): Promise<void> {
    await this.trySettlePayment(message.eventId, message.aggregateId);
  }

  @EventPattern('payment.failed.v1')
  async handlePaymentFailed(@Payload() message: any): Promise<void> {
    const aggregateId = message.aggregateId || message.id;
    this.logger.warn(`Saga reacting to failure for payment ${aggregateId}`);
    await this.dataSource.manager.update(Payment, { id: aggregateId }, { status: PaymentStatus.FAILED });
  }

  private async trySettlePayment(eventId: string, aggregateId: string): Promise<void> {
    if (!eventId || !aggregateId) return;

    // Check if both Fraud and Ledger processed
    const fraudProcessed = await this.processedRepo.exists(eventId, 'FraudConsumer');
    const ledgerProcessed = await this.processedRepo.exists(eventId, 'LedgerConsumer');

    if (fraudProcessed && ledgerProcessed) {
      this.logger.log(`Both consumers processed for ${aggregateId}. Settling payment.`);
      
      // Update Payment status to SETTLED
      await this.dataSource.manager.update(Payment, { id: aggregateId }, { status: PaymentStatus.SETTLED });
      
      // Optionally emit payment.settled.v1 here
    }
  }
}

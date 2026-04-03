import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientKafka, KafkaContext } from '@nestjs/microservices';
import { ProcessedEventsRepository } from './processed-events.repository';

@Injectable()
export class LedgerConsumer {
  private readonly logger = new Logger(LedgerConsumer.name);
  private readonly consumerName = 'LedgerConsumer';

  constructor(
    private readonly processedRepo: ProcessedEventsRepository,
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka,
  ) {}

  async handlePaymentCreated(message: any, context: KafkaContext): Promise<void> {
    const value = message;
    const eventId = value.eventId || context.getMessage().key?.toString();
    const aggregateId = value.aggregateId || value.id;

    if (!eventId) {
      this.logger.warn('Received message without eventId, skipping');
      return;
    }

    try {
      const alreadyProcessed = await this.processedRepo.exists(eventId, this.consumerName);
      if (alreadyProcessed) {
        this.logger.log(`Event ${eventId} already processed by ${this.consumerName}`);
        return;
      }

      this.logger.log(`Processing ledger entry (double-entry write) for payment ${aggregateId}`);
      // Simulate double-entry write logic
      // e.g., debit sender, credit receiver

      // Mark processed
      await this.processedRepo.markProcessed(eventId, this.consumerName);
      
      this.logger.log(`Ledger entry written for payment ${aggregateId}`);
      
      const countryPrefix = (value.country || 'gen').toLowerCase();

      // Emit success for this stage
      this.kafkaClient.emit(`${countryPrefix}.payment.ledger.written.v1`, {
        key: aggregateId,
        value: { aggregateId, eventId, status: 'WRITTEN' },
      });

    } catch (error) {
       this.logger.error(`Error processing ${eventId} in Ledger: ${error.message}`);
       
       const countryPrefix = (value.country || 'gen').toLowerCase();
       await this.sendToDlt(`${countryPrefix}.payment.created.v1`, value, error);
    }
  }

  private async sendToDlt(originalTopic: string, message: any, error: Error) {
    const dltTopic = `${originalTopic}.dlt`;
    const aggregateId = message.aggregateId || message.id;
    const countryPrefix = (message.country || 'gen').toLowerCase();

    this.logger.warn(`Sending to DLT -> ${dltTopic}`);
    this.kafkaClient.emit(dltTopic, {
      key: aggregateId,
      value: {
        originalTopic,
        originalMessage: message,
        error: error.message,
        failedAt: new Date().toISOString(),
      },
    });

    this.logger.warn(`Emitting failure event to ${countryPrefix}.payment.failed.v1`);
    this.kafkaClient.emit(`${countryPrefix}.payment.failed.v1`, {
      key: aggregateId,
      value: { aggregateId, reason: error.message },
    });
  }
}

import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientKafka, KafkaContext } from '@nestjs/microservices';
import { ProcessedEventsRepository } from './processed-events.repository';

@Injectable()
export class FraudConsumer {
  private readonly logger = new Logger(FraudConsumer.name);
  private readonly consumerName = 'FraudConsumer';
  private readonly maxRetries = 3;

  constructor(
    private readonly processedRepo: ProcessedEventsRepository,
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka,
  ) {}

  async handlePaymentCreated(message: any, context: KafkaContext): Promise<void> {
    const value = message; // Depending on NestJS config, it might automatically parse the value
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

      this.logger.log(`Processing fraud scoring for payment ${aggregateId}`);
      // Simulate Fraud check logic... Wait a bit.
      
      // Simulating external logic and possibility of failure
      if (value.amount > 1000000) {
          throw new Error('Fraud check failed: amount too high.');
      }

      // Mark processed
      await this.processedRepo.markProcessed(eventId, this.consumerName);
      
      this.logger.log(`Fraud scoring passed for payment ${aggregateId}`);
      
      const countryPrefix = (value.country || 'gen').toLowerCase();

      // Emit success for this stage
      this.kafkaClient.emit(`${countryPrefix}.payment.fraud.approved.v1`, {
        key: aggregateId,
        value: { aggregateId, eventId, status: 'APPROVED' },
      });

    } catch (error) {
       this.logger.error(`Error processing ${eventId} in Fraud: ${error.message}`);
       
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

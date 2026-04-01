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
      
      // Emit success for this stage
      this.kafkaClient.emit('payment.fraud.approved.v1', {
        key: aggregateId,
        value: { aggregateId, eventId, status: 'APPROVED' },
      });

    } catch (error) {
       this.logger.error(`Error processing ${eventId} in Fraud: ${error.message}`);
       
       // Note: Native Kafka retries might handle retries, but for DLT pattern we manage it:
       // For a strict retry budget we could read headers or a local table. 
       // Simplification: assume it failed permanently after standard catches, send to DLT.
       
       await this.sendToDlt('payment.created.v1', value, error);
    }
  }

  private async sendToDlt(originalTopic: string, message: any, error: Error) {
    const dltTopic = `${originalTopic}.dlt`;
    const aggregateId = message.aggregateId || message.id;

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

    this.kafkaClient.emit('payment.failed.v1', {
      key: aggregateId,
      value: { aggregateId, reason: error.message },
    });
  }
}

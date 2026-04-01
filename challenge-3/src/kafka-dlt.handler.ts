import { Injectable, Logger } from '@nestjs/common';
import { Kafka, Producer, Message } from 'kafkajs';

@Injectable()
export class KafkaDltHandler {
  private readonly logger = new Logger(KafkaDltHandler.name);
  private producer: Producer;

  constructor(private readonly client: Kafka) {
    this.producer = this.client.producer();
  }

  async connect(): Promise<void> {
    await this.producer.connect();
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
  }

  async route(originalTopic: string, message: any, error: Error): Promise<void> {
    const dltTopic = `${originalTopic}.dlt`;
    this.logger.warn(`Routing message to DLT topic: ${dltTopic} due to error: ${error.message}`);

    const payload: Message = {
      key: message.key,
      value: JSON.stringify({
        originalTopic,
        originalPayload: message.value?.toString(),
        error: error.message,
        failedAt: new Date().toISOString(),
      }),
      headers: {
        'x-original-topic': originalTopic,
        'x-error-type': error.constructor.name,
      },
    };

    await this.producer.send({
      topic: dltTopic,
      messages: [payload],
    });
  }
}

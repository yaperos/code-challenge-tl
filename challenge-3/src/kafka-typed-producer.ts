import { Injectable, Logger } from '@nestjs/common';
import { Producer, Kafka } from 'kafkajs';
import { EventContract } from './types/event-contract.type';

@Injectable()
export class KafkaTypedProducer {
  private readonly logger = new Logger(KafkaTypedProducer.name);
  private producers: Map<string, Producer> = new Map();

  constructor(private readonly client: Kafka) {}

  async publish<T extends object>(
    topic: string,
    payload: EventContract<T>, // type-safe schema checking at compile time
  ): Promise<void> {
    let producer = this.producers.get(topic);
    if (!producer) {
      producer = this.client.producer();
      await producer.connect();
      this.producers.set(topic, producer);
      this.logger.log(`Initialized and connected producer for topic: ${topic}`);
    }

    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(payload) }],
    });
    
    this.logger.debug(`Published message to ${topic}: ${JSON.stringify(payload.eventId)}`);
  }

  async disconnectAll(): Promise<void> {
    for (const producer of this.producers.values()) {
      await producer.disconnect();
    }
  }
}

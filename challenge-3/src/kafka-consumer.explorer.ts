import { Injectable, OnModuleInit, OnModuleDestroy, Logger, Inject } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { KAFKA_EVENT_METADATA } from './decorators/kafka-event.decorator';
import { KafkaDltHandler } from './kafka-dlt.handler';

export const KAFKA_CONSUMER_GROUP = 'KAFKA_CONSUMER_GROUP';

@Injectable()
export class KafkaConsumerExplorer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerExplorer.name);
  private consumer: Consumer;

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
    private readonly client: Kafka,
    private readonly dltHandler: KafkaDltHandler,
    @Inject(KAFKA_CONSUMER_GROUP) private readonly groupId: string,
  ) {
    if (this.groupId) {
      this.consumer = this.client.consumer({ groupId: this.groupId });
    }
  }

  async onModuleInit(): Promise<void> {
    if (!this.consumer) {
      return; // No consumer logic if no groupId
    }

    const providers = this.discoveryService.getProviders();
    const controllers = this.discoveryService.getControllers();
    const allInstances = [...providers, ...controllers];

    const handlers: Array<{ topic: string; handler: Function; instance: unknown }> = [];

    allInstances.forEach((wrapper) => {
      const { instance } = wrapper;
      if (!instance || typeof instance !== 'object' || !Object.getPrototypeOf(instance)) {
        return;
      }

      const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(instance));

      methodNames.forEach((methodName) => {
        const method = instance[methodName as keyof typeof instance];
        if (typeof method === 'function') {
          const metadata = this.reflector.get<{ topic: string }>(
            KAFKA_EVENT_METADATA,
            method,
          );

          if (metadata && metadata.topic) {
            handlers.push({
              topic: metadata.topic,
              handler: method.bind(instance),
              instance,
            });
            this.logger.log(`Mapped {${metadata.topic}} event to ${instance.constructor.name}.${methodName}()`);
          }
        }
      });
    });

    if (handlers.length === 0) return;

    await this.consumer.connect();

    for (const handler of handlers) {
      await this.consumer.subscribe({ topic: handler.topic, fromBeginning: false });
    }

    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        const matchingHandlers = handlers.filter((h) => h.topic === payload.topic);
        for (const handlerConf of matchingHandlers) {
          await this.executeWithRetryAndDlt(handlerConf, payload);
        }
      },
    });
  }

  private async executeWithRetryAndDlt(
    handlerConf: { topic: string; handler: Function; instance: any },
    payload: EachMessagePayload,
  ): Promise<void> {
    let attempts = 0;
    const maxRetries = handlerConf.instance?.maxRetries ?? 3;
    const { message, topic } = payload;

    while (attempts <= maxRetries) {
      try {
        const parsedMessage = JSON.parse(message.value?.toString() || '{}');
        await handlerConf.handler(parsedMessage);
        return; // Success
      } catch (error) {
        attempts++;
        this.logger.error(`Error processing message on ${topic} (Attempt ${attempts}/${maxRetries}): ${error.message}`);
        
        if (attempts > maxRetries) {
          this.logger.warn(`Max retries exceeded for topic ${topic}. Routing to DLT.`);
          await this.dltHandler.connect();
          await this.dltHandler.route(topic, message, error as Error);
          return; // Done handling DLT
        }
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.consumer) {
      await this.consumer.disconnect();
    }
    await this.dltHandler.disconnect();
  }
}

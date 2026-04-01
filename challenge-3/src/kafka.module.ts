import { DynamicModule, Module, Provider, Global } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { Kafka } from 'kafkajs';
import { KafkaConsumerExplorer, KAFKA_CONSUMER_GROUP } from './kafka-consumer.explorer';
import { KafkaTypedProducer } from './kafka-typed-producer';
import { KafkaDltHandler } from './kafka-dlt.handler';

export interface KafkaFeatureOptions {
  topics: string[];
  consumerGroup?: string;
  brokers?: string[];
}

@Global()
@Module({
  imports: [DiscoveryModule],
})
export class KafkaModule {
  static forFeature(options: KafkaFeatureOptions): DynamicModule {
    const brokers = options.brokers || process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'];

    const clientProvider: Provider = {
      provide: Kafka,
      useFactory: () => {
        return new Kafka({
          clientId: `yape-kafka-module-${Math.random().toString(36).substring(7)}`,
          brokers: brokers,
        });
      },
    };

    const groupIdProvider: Provider = {
      provide: KAFKA_CONSUMER_GROUP,
      useValue: options.consumerGroup || '',
    };

    return {
      module: KafkaModule,
      providers: [
        clientProvider,
        groupIdProvider,
        KafkaTypedProducer,
        KafkaDltHandler,
        KafkaConsumerExplorer,
      ],
      exports: [KafkaTypedProducer], // Squads will use KafkaTypedProducer to publish
    };
  }
}

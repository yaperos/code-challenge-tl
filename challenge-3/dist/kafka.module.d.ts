import { DynamicModule } from '@nestjs/common';
import { KafkaConsumerExplorer } from './kafka-consumer.explorer';
export interface KafkaFeatureOptions {
    topics: string[];
    consumerGroup?: string;
    brokers?: string[];
}
export declare class KafkaModule {
    private readonly explorer;
    constructor(explorer: KafkaConsumerExplorer);
    static forFeature(options: KafkaFeatureOptions): DynamicModule;
}

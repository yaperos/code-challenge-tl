import { DynamicModule } from '@nestjs/common';
export interface KafkaFeatureOptions {
    topics: string[];
    consumerGroup?: string;
    brokers?: string[];
}
export declare class KafkaModule {
    static forFeature(options: KafkaFeatureOptions): DynamicModule;
}

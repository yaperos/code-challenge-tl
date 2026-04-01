import { Kafka } from 'kafkajs';
import { EventContract } from './types/event-contract.type';
export declare class KafkaTypedProducer {
    private readonly client;
    private readonly logger;
    private producers;
    constructor(client: Kafka);
    publish<T extends object>(topic: string, payload: EventContract<T>): Promise<void>;
    disconnectAll(): Promise<void>;
}

import { Kafka } from 'kafkajs';
export declare class KafkaDltHandler {
    private readonly client;
    private readonly logger;
    private producer;
    constructor(client: Kafka);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    route(originalTopic: string, message: any, error: Error): Promise<void>;
}

import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { Kafka } from 'kafkajs';
import { KafkaDltHandler } from './kafka-dlt.handler';
export declare const KAFKA_CONSUMER_GROUP = "KAFKA_CONSUMER_GROUP";
export declare class KafkaConsumerExplorer implements OnModuleInit, OnModuleDestroy {
    private readonly discoveryService;
    private readonly reflector;
    private readonly client;
    private readonly dltHandler;
    private readonly groupId;
    private readonly logger;
    private consumer;
    constructor(discoveryService: DiscoveryService, reflector: Reflector, client: Kafka, dltHandler: KafkaDltHandler, groupId: string);
    onModuleInit(): Promise<void>;
    private executeWithRetryAndDlt;
    onModuleDestroy(): Promise<void>;
}

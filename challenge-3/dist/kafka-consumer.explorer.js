"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var KafkaConsumerExplorer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaConsumerExplorer = exports.KAFKA_CONSUMER_GROUP = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const kafkajs_1 = require("kafkajs");
const kafka_event_decorator_1 = require("./decorators/kafka-event.decorator");
const kafka_dlt_handler_1 = require("./kafka-dlt.handler");
exports.KAFKA_CONSUMER_GROUP = 'KAFKA_CONSUMER_GROUP';
let KafkaConsumerExplorer = KafkaConsumerExplorer_1 = class KafkaConsumerExplorer {
    discoveryService;
    reflector;
    client;
    dltHandler;
    groupId;
    logger = new common_1.Logger(KafkaConsumerExplorer_1.name);
    consumer;
    constructor(discoveryService, reflector, client, dltHandler, groupId) {
        this.discoveryService = discoveryService;
        this.reflector = reflector;
        this.client = client;
        this.dltHandler = dltHandler;
        this.groupId = groupId;
        if (this.groupId) {
            this.consumer = this.client.consumer({ groupId: this.groupId });
        }
    }
    async onModuleInit() {
        if (!this.consumer) {
            return;
        }
        const providers = this.discoveryService.getProviders();
        const handlers = [];
        providers.forEach((wrapper) => {
            const { instance } = wrapper;
            if (!instance || typeof instance !== 'object' || !Object.getPrototypeOf(instance)) {
                return;
            }
            const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(instance));
            methodNames.forEach((methodName) => {
                const method = instance[methodName];
                if (typeof method === 'function') {
                    const metadata = this.reflector.get(kafka_event_decorator_1.KAFKA_EVENT_METADATA, method);
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
        if (handlers.length === 0)
            return;
        await this.consumer.connect();
        for (const handler of handlers) {
            await this.consumer.subscribe({ topic: handler.topic, fromBeginning: false });
        }
        await this.consumer.run({
            eachMessage: async (payload) => {
                const matchingHandlers = handlers.filter((h) => h.topic === payload.topic);
                for (const handlerConf of matchingHandlers) {
                    await this.executeWithRetryAndDlt(handlerConf, payload);
                }
            },
        });
    }
    async executeWithRetryAndDlt(handlerConf, payload) {
        let attempts = 0;
        const maxRetries = handlerConf.instance?.maxRetries ?? 3;
        const { message, topic } = payload;
        while (attempts <= maxRetries) {
            try {
                const parsedMessage = JSON.parse(message.value?.toString() || '{}');
                await handlerConf.handler(parsedMessage);
                return;
            }
            catch (error) {
                attempts++;
                this.logger.error(`Error processing message on ${topic} (Attempt ${attempts}/${maxRetries}): ${error.message}`);
                if (attempts > maxRetries) {
                    this.logger.warn(`Max retries exceeded for topic ${topic}. Routing to DLT.`);
                    await this.dltHandler.connect();
                    await this.dltHandler.route(topic, message, error);
                    return;
                }
            }
        }
    }
    async onModuleDestroy() {
        if (this.consumer) {
            await this.consumer.disconnect();
        }
        await this.dltHandler.disconnect();
    }
};
exports.KafkaConsumerExplorer = KafkaConsumerExplorer;
exports.KafkaConsumerExplorer = KafkaConsumerExplorer = KafkaConsumerExplorer_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, common_1.Inject)(exports.KAFKA_CONSUMER_GROUP)),
    __metadata("design:paramtypes", [core_1.DiscoveryService,
        core_1.Reflector,
        kafkajs_1.Kafka,
        kafka_dlt_handler_1.KafkaDltHandler, String])
], KafkaConsumerExplorer);
//# sourceMappingURL=kafka-consumer.explorer.js.map
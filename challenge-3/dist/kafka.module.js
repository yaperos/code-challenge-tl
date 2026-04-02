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
var KafkaModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const kafkajs_1 = require("kafkajs");
const kafka_consumer_explorer_1 = require("./kafka-consumer.explorer");
const kafka_typed_producer_1 = require("./kafka-typed-producer");
const kafka_dlt_handler_1 = require("./kafka-dlt.handler");
let KafkaModule = KafkaModule_1 = class KafkaModule {
    explorer;
    constructor(explorer) {
        this.explorer = explorer;
    }
    static forFeature(options) {
        const brokers = options.brokers || process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'];
        const clientProvider = {
            provide: kafkajs_1.Kafka,
            useFactory: () => {
                return new kafkajs_1.Kafka({
                    clientId: `yape-kafka-module-${Math.random().toString(36).substring(7)}`,
                    brokers: brokers,
                });
            },
        };
        const groupIdProvider = {
            provide: kafka_consumer_explorer_1.KAFKA_CONSUMER_GROUP,
            useValue: options.consumerGroup || '',
        };
        return {
            module: KafkaModule_1,
            providers: [
                clientProvider,
                groupIdProvider,
                kafka_typed_producer_1.KafkaTypedProducer,
                kafka_dlt_handler_1.KafkaDltHandler,
                kafka_consumer_explorer_1.KafkaConsumerExplorer,
            ],
            exports: [kafka_typed_producer_1.KafkaTypedProducer],
        };
    }
};
exports.KafkaModule = KafkaModule;
exports.KafkaModule = KafkaModule = KafkaModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [core_1.DiscoveryModule],
    }),
    __metadata("design:paramtypes", [kafka_consumer_explorer_1.KafkaConsumerExplorer])
], KafkaModule);
//# sourceMappingURL=kafka.module.js.map
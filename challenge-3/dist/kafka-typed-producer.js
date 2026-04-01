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
var KafkaTypedProducer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaTypedProducer = void 0;
const common_1 = require("@nestjs/common");
const kafkajs_1 = require("kafkajs");
let KafkaTypedProducer = KafkaTypedProducer_1 = class KafkaTypedProducer {
    client;
    logger = new common_1.Logger(KafkaTypedProducer_1.name);
    producers = new Map();
    constructor(client) {
        this.client = client;
    }
    async publish(topic, payload) {
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
    async disconnectAll() {
        for (const producer of this.producers.values()) {
            await producer.disconnect();
        }
    }
};
exports.KafkaTypedProducer = KafkaTypedProducer;
exports.KafkaTypedProducer = KafkaTypedProducer = KafkaTypedProducer_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [kafkajs_1.Kafka])
], KafkaTypedProducer);
//# sourceMappingURL=kafka-typed-producer.js.map
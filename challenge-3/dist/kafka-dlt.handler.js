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
var KafkaDltHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaDltHandler = void 0;
const common_1 = require("@nestjs/common");
const kafkajs_1 = require("kafkajs");
let KafkaDltHandler = KafkaDltHandler_1 = class KafkaDltHandler {
    client;
    logger = new common_1.Logger(KafkaDltHandler_1.name);
    producer;
    constructor(client) {
        this.client = client;
        this.producer = this.client.producer();
    }
    async connect() {
        await this.producer.connect();
    }
    async disconnect() {
        await this.producer.disconnect();
    }
    async route(originalTopic, message, error) {
        const dltTopic = `${originalTopic}.dlt`;
        this.logger.warn(`Routing message to DLT topic: ${dltTopic} due to error: ${error.message}`);
        const payload = {
            key: message.key,
            value: JSON.stringify({
                originalTopic,
                originalPayload: message.value?.toString(),
                error: error.message,
                failedAt: new Date().toISOString(),
            }),
            headers: {
                'x-original-topic': originalTopic,
                'x-error-type': error.constructor.name,
            },
        };
        await this.producer.send({
            topic: dltTopic,
            messages: [payload],
        });
    }
};
exports.KafkaDltHandler = KafkaDltHandler;
exports.KafkaDltHandler = KafkaDltHandler = KafkaDltHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [kafkajs_1.Kafka])
], KafkaDltHandler);
//# sourceMappingURL=kafka-dlt.handler.js.map
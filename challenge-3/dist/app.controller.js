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
var AppController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const kafka_typed_producer_1 = require("./kafka-typed-producer");
const kafka_event_decorator_1 = require("./decorators/kafka-event.decorator");
let AppController = AppController_1 = class AppController {
    appService;
    producer;
    logger = new common_1.Logger(AppController_1.name);
    maxRetries = 2;
    constructor(appService, producer) {
        this.appService = appService;
        this.producer = producer;
    }
    getHello() {
        return this.appService.getHello();
    }
    async testPublish(body) {
        await this.producer.publish('payment.created.v1', {
            eventId: Math.random().toString(),
            eventType: 'payment.created.v1',
            version: 1,
            producer: 'squad-payments',
            occurredAt: new Date().toISOString(),
            data: {
                paymentId: 'PAY-123456',
                amount: body.amount || 100,
                currency: 'PEN',
                fromCountry: 'PE',
            },
        });
        return { status: 'published' };
    }
    async handlePaymentCreated(event) {
        this.logger.log(`Received Kafka Event in Squad Consumer: ${JSON.stringify(event.data)}`);
        if (event.data.amount > 1000) {
            this.logger.error('Amount too high! Simulating crash to trigger DLT handler...');
            throw new Error('Amount exceeds maximum allowed limit. Simulating failure.');
        }
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Post)('/test-publish'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "testPublish", null);
__decorate([
    (0, kafka_event_decorator_1.KafkaEvent)('payment.created.v1'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "handlePaymentCreated", null);
exports.AppController = AppController = AppController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService,
        kafka_typed_producer_1.KafkaTypedProducer])
], AppController);
//# sourceMappingURL=app.controller.js.map
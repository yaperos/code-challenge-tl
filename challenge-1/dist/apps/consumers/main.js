/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 2 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ConsumersModule = void 0;
const common_1 = __webpack_require__(3);
const microservices_1 = __webpack_require__(4);
const shared_1 = __webpack_require__(5);
const fraud_consumer_1 = __webpack_require__(16);
const ledger_consumer_1 = __webpack_require__(18);
const saga_consumer_1 = __webpack_require__(19);
const processed_events_repository_1 = __webpack_require__(17);
let ConsumersModule = class ConsumersModule {
};
exports.ConsumersModule = ConsumersModule;
exports.ConsumersModule = ConsumersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            shared_1.DatabaseModule,
            microservices_1.ClientsModule.register([
                {
                    name: 'KAFKA_CLIENT',
                    transport: microservices_1.Transport.KAFKA,
                    options: {
                        client: {
                            clientId: 'payment-consumers',
                            brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
                        },
                        consumer: {
                            groupId: 'consumers-group',
                        },
                    },
                },
            ]),
        ],
        providers: [
            fraud_consumer_1.FraudConsumer,
            ledger_consumer_1.LedgerConsumer,
            saga_consumer_1.SagaConsumer,
            processed_events_repository_1.ProcessedEventsRepository
        ],
    })
], ConsumersModule);


/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("@nestjs/microservices");

/***/ }),
/* 5 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(6), exports);
__exportStar(__webpack_require__(7), exports);
__exportStar(__webpack_require__(8), exports);
__exportStar(__webpack_require__(10), exports);
__exportStar(__webpack_require__(11), exports);
__exportStar(__webpack_require__(12), exports);
__exportStar(__webpack_require__(14), exports);


/***/ }),
/* 6 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SharedModule = void 0;
const common_1 = __webpack_require__(3);
const shared_service_1 = __webpack_require__(7);
let SharedModule = class SharedModule {
};
exports.SharedModule = SharedModule;
exports.SharedModule = SharedModule = __decorate([
    (0, common_1.Module)({
        providers: [shared_service_1.SharedService],
        exports: [shared_service_1.SharedService],
    })
], SharedModule);


/***/ }),
/* 7 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SharedService = void 0;
const common_1 = __webpack_require__(3);
let SharedService = class SharedService {
};
exports.SharedService = SharedService;
exports.SharedService = SharedService = __decorate([
    (0, common_1.Injectable)()
], SharedService);


/***/ }),
/* 8 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Payment = exports.PaymentStatus = void 0;
const typeorm_1 = __webpack_require__(9);
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["SETTLED"] = "SETTLED";
    PaymentStatus["FAILED"] = "FAILED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
let Payment = class Payment {
    id;
    amount;
    currency;
    country;
    status;
    createdAt;
    updatedAt;
};
exports.Payment = Payment;
__decorate([
    (0, typeorm_1.PrimaryColumn)('uuid'),
    __metadata("design:type", String)
], Payment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Payment.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Payment.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Payment.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING,
    }),
    __metadata("design:type", String)
], Payment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], Payment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], Payment.prototype, "updatedAt", void 0);
exports.Payment = Payment = __decorate([
    (0, typeorm_1.Entity)('payments')
], Payment);


/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("typeorm");

/***/ }),
/* 10 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OutboxEvent = exports.OutboxStatus = void 0;
const typeorm_1 = __webpack_require__(9);
var OutboxStatus;
(function (OutboxStatus) {
    OutboxStatus["PENDING"] = "PENDING";
    OutboxStatus["SENT"] = "SENT";
    OutboxStatus["FAILED"] = "FAILED";
})(OutboxStatus || (exports.OutboxStatus = OutboxStatus = {}));
let OutboxEvent = class OutboxEvent {
    eventId;
    aggregateId;
    eventType;
    payload;
    status;
    retryCount;
    createdAt;
    sentAt;
};
exports.OutboxEvent = OutboxEvent;
__decorate([
    (0, typeorm_1.PrimaryColumn)('uuid'),
    __metadata("design:type", String)
], OutboxEvent.prototype, "eventId", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], OutboxEvent.prototype, "aggregateId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], OutboxEvent.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb'),
    __metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], OutboxEvent.prototype, "payload", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: OutboxStatus,
        default: OutboxStatus.PENDING,
    }),
    __metadata("design:type", String)
], OutboxEvent.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], OutboxEvent.prototype, "retryCount", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], OutboxEvent.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], OutboxEvent.prototype, "sentAt", void 0);
exports.OutboxEvent = OutboxEvent = __decorate([
    (0, typeorm_1.Entity)('outbox_events'),
    (0, typeorm_1.Index)('idx_outbox_status', ['status', 'createdAt'])
], OutboxEvent);


/***/ }),
/* 11 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProcessedEvent = void 0;
const typeorm_1 = __webpack_require__(9);
let ProcessedEvent = class ProcessedEvent {
    eventId;
    consumer;
    processedAt;
};
exports.ProcessedEvent = ProcessedEvent;
__decorate([
    (0, typeorm_1.PrimaryColumn)('uuid'),
    __metadata("design:type", String)
], ProcessedEvent.prototype, "eventId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ length: 50 }),
    __metadata("design:type", String)
], ProcessedEvent.prototype, "consumer", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], ProcessedEvent.prototype, "processedAt", void 0);
exports.ProcessedEvent = ProcessedEvent = __decorate([
    (0, typeorm_1.Entity)('processed_events')
], ProcessedEvent);


/***/ }),
/* 12 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseModule = void 0;
const common_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(13);
const payment_entity_1 = __webpack_require__(8);
const outbox_event_entity_1 = __webpack_require__(10);
const processed_event_entity_1 = __webpack_require__(11);
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '5432', 10),
                username: process.env.DB_USER || 'user',
                password: process.env.DB_PASSWORD || 'password',
                database: process.env.DB_NAME || 'payments_db',
                entities: [payment_entity_1.Payment, outbox_event_entity_1.OutboxEvent, processed_event_entity_1.ProcessedEvent],
                synchronize: true,
            }),
            typeorm_1.TypeOrmModule.forFeature([payment_entity_1.Payment, outbox_event_entity_1.OutboxEvent, processed_event_entity_1.ProcessedEvent]),
        ],
        exports: [typeorm_1.TypeOrmModule],
    })
], DatabaseModule);


/***/ }),
/* 13 */
/***/ ((module) => {

module.exports = require("@nestjs/typeorm");

/***/ }),
/* 14 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreatePaymentDto = void 0;
const class_validator_1 = __webpack_require__(15);
class CreatePaymentDto {
    amount;
    currency;
    country;
}
exports.CreatePaymentDto = CreatePaymentDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreatePaymentDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "country", void 0);


/***/ }),
/* 15 */
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),
/* 16 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var FraudConsumer_1;
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FraudConsumer = void 0;
const common_1 = __webpack_require__(3);
const microservices_1 = __webpack_require__(4);
const processed_events_repository_1 = __webpack_require__(17);
let FraudConsumer = FraudConsumer_1 = class FraudConsumer {
    processedRepo;
    kafkaClient;
    logger = new common_1.Logger(FraudConsumer_1.name);
    consumerName = 'FraudConsumer';
    maxRetries = 3;
    constructor(processedRepo, kafkaClient) {
        this.processedRepo = processedRepo;
        this.kafkaClient = kafkaClient;
    }
    async handlePaymentCreated(message, context) {
        const value = message;
        const eventId = value.eventId || context.getMessage().key?.toString();
        const aggregateId = value.aggregateId || value.id;
        if (!eventId) {
            this.logger.warn('Received message without eventId, skipping');
            return;
        }
        try {
            const alreadyProcessed = await this.processedRepo.exists(eventId, this.consumerName);
            if (alreadyProcessed) {
                this.logger.log(`Event ${eventId} already processed by ${this.consumerName}`);
                return;
            }
            this.logger.log(`Processing fraud scoring for payment ${aggregateId}`);
            if (value.amount > 1000000) {
                throw new Error('Fraud check failed: amount too high.');
            }
            await this.processedRepo.markProcessed(eventId, this.consumerName);
            this.logger.log(`Fraud scoring passed for payment ${aggregateId}`);
            this.kafkaClient.emit('payment.fraud.approved.v1', {
                key: aggregateId,
                value: { aggregateId, eventId, status: 'APPROVED' },
            });
        }
        catch (error) {
            this.logger.error(`Error processing ${eventId} in Fraud: ${error.message}`);
            await this.sendToDlt('payment.created.v1', value, error);
        }
    }
    async sendToDlt(originalTopic, message, error) {
        const dltTopic = `${originalTopic}.dlt`;
        const aggregateId = message.aggregateId || message.id;
        this.logger.warn(`Sending to DLT -> ${dltTopic}`);
        this.kafkaClient.emit(dltTopic, {
            key: aggregateId,
            value: {
                originalTopic,
                originalMessage: message,
                error: error.message,
                failedAt: new Date().toISOString(),
            },
        });
        this.kafkaClient.emit('payment.failed.v1', {
            key: aggregateId,
            value: { aggregateId, reason: error.message },
        });
    }
};
exports.FraudConsumer = FraudConsumer;
__decorate([
    (0, microservices_1.EventPattern)('payment.created.v1'),
    __param(0, (0, microservices_1.Payload)()),
    __param(1, (0, microservices_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_c = typeof microservices_1.KafkaContext !== "undefined" && microservices_1.KafkaContext) === "function" ? _c : Object]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], FraudConsumer.prototype, "handlePaymentCreated", null);
exports.FraudConsumer = FraudConsumer = FraudConsumer_1 = __decorate([
    (0, common_1.Controller)(),
    __param(1, (0, common_1.Inject)('KAFKA_CLIENT')),
    __metadata("design:paramtypes", [typeof (_a = typeof processed_events_repository_1.ProcessedEventsRepository !== "undefined" && processed_events_repository_1.ProcessedEventsRepository) === "function" ? _a : Object, typeof (_b = typeof microservices_1.ClientKafka !== "undefined" && microservices_1.ClientKafka) === "function" ? _b : Object])
], FraudConsumer);


/***/ }),
/* 17 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProcessedEventsRepository = void 0;
const common_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(9);
const shared_1 = __webpack_require__(5);
let ProcessedEventsRepository = class ProcessedEventsRepository {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async exists(eventId, consumer) {
        const record = await this.dataSource.manager.findOne(shared_1.ProcessedEvent, {
            where: { eventId, consumer },
        });
        return !!record;
    }
    async markProcessed(eventId, consumer) {
        const record = this.dataSource.manager.create(shared_1.ProcessedEvent, {
            eventId,
            consumer,
        });
        await this.dataSource.manager.save(record);
    }
};
exports.ProcessedEventsRepository = ProcessedEventsRepository;
exports.ProcessedEventsRepository = ProcessedEventsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_1.DataSource !== "undefined" && typeorm_1.DataSource) === "function" ? _a : Object])
], ProcessedEventsRepository);


/***/ }),
/* 18 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var LedgerConsumer_1;
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LedgerConsumer = void 0;
const common_1 = __webpack_require__(3);
const microservices_1 = __webpack_require__(4);
const processed_events_repository_1 = __webpack_require__(17);
let LedgerConsumer = LedgerConsumer_1 = class LedgerConsumer {
    processedRepo;
    kafkaClient;
    logger = new common_1.Logger(LedgerConsumer_1.name);
    consumerName = 'LedgerConsumer';
    constructor(processedRepo, kafkaClient) {
        this.processedRepo = processedRepo;
        this.kafkaClient = kafkaClient;
    }
    async handlePaymentCreated(message, context) {
        const value = message;
        const eventId = value.eventId || context.getMessage().key?.toString();
        const aggregateId = value.aggregateId || value.id;
        if (!eventId) {
            this.logger.warn('Received message without eventId, skipping');
            return;
        }
        try {
            const alreadyProcessed = await this.processedRepo.exists(eventId, this.consumerName);
            if (alreadyProcessed) {
                this.logger.log(`Event ${eventId} already processed by ${this.consumerName}`);
                return;
            }
            this.logger.log(`Processing ledger entry (double-entry write) for payment ${aggregateId}`);
            await this.processedRepo.markProcessed(eventId, this.consumerName);
            this.logger.log(`Ledger entry written for payment ${aggregateId}`);
            this.kafkaClient.emit('payment.ledger.written.v1', {
                key: aggregateId,
                value: { aggregateId, eventId, status: 'WRITTEN' },
            });
        }
        catch (error) {
            this.logger.error(`Error processing ${eventId} in Ledger: ${error.message}`);
            await this.sendToDlt('payment.created.v1', value, error);
        }
    }
    async sendToDlt(originalTopic, message, error) {
        const dltTopic = `${originalTopic}.dlt`;
        const aggregateId = message.aggregateId || message.id;
        this.logger.warn(`Sending to DLT -> ${dltTopic}`);
        this.kafkaClient.emit(dltTopic, {
            key: aggregateId,
            value: {
                originalTopic,
                originalMessage: message,
                error: error.message,
                failedAt: new Date().toISOString(),
            },
        });
        this.kafkaClient.emit('payment.failed.v1', {
            key: aggregateId,
            value: { aggregateId, reason: error.message },
        });
    }
};
exports.LedgerConsumer = LedgerConsumer;
__decorate([
    (0, microservices_1.EventPattern)('payment.created.v1'),
    __param(0, (0, microservices_1.Payload)()),
    __param(1, (0, microservices_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_c = typeof microservices_1.KafkaContext !== "undefined" && microservices_1.KafkaContext) === "function" ? _c : Object]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], LedgerConsumer.prototype, "handlePaymentCreated", null);
exports.LedgerConsumer = LedgerConsumer = LedgerConsumer_1 = __decorate([
    (0, common_1.Controller)(),
    __param(1, (0, common_1.Inject)('KAFKA_CLIENT')),
    __metadata("design:paramtypes", [typeof (_a = typeof processed_events_repository_1.ProcessedEventsRepository !== "undefined" && processed_events_repository_1.ProcessedEventsRepository) === "function" ? _a : Object, typeof (_b = typeof microservices_1.ClientKafka !== "undefined" && microservices_1.ClientKafka) === "function" ? _b : Object])
], LedgerConsumer);


/***/ }),
/* 19 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var SagaConsumer_1;
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SagaConsumer = void 0;
const common_1 = __webpack_require__(3);
const microservices_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(9);
const processed_events_repository_1 = __webpack_require__(17);
const shared_1 = __webpack_require__(5);
let SagaConsumer = SagaConsumer_1 = class SagaConsumer {
    dataSource;
    processedRepo;
    logger = new common_1.Logger(SagaConsumer_1.name);
    constructor(dataSource, processedRepo) {
        this.dataSource = dataSource;
        this.processedRepo = processedRepo;
    }
    async handleFraudApproved(message) {
        await this.trySettlePayment(message.eventId, message.aggregateId);
    }
    async handleLedgerWritten(message) {
        await this.trySettlePayment(message.eventId, message.aggregateId);
    }
    async handlePaymentFailed(message) {
        const aggregateId = message.aggregateId || message.id;
        this.logger.warn(`Saga reacting to failure for payment ${aggregateId}`);
        await this.dataSource.manager.update(shared_1.Payment, { id: aggregateId }, { status: shared_1.PaymentStatus.FAILED });
    }
    async trySettlePayment(eventId, aggregateId) {
        if (!eventId || !aggregateId)
            return;
        const fraudProcessed = await this.processedRepo.exists(eventId, 'FraudConsumer');
        const ledgerProcessed = await this.processedRepo.exists(eventId, 'LedgerConsumer');
        if (fraudProcessed && ledgerProcessed) {
            this.logger.log(`Both consumers processed for ${aggregateId}. Settling payment.`);
            await this.dataSource.manager.update(shared_1.Payment, { id: aggregateId }, { status: shared_1.PaymentStatus.SETTLED });
        }
    }
};
exports.SagaConsumer = SagaConsumer;
__decorate([
    (0, microservices_1.EventPattern)('payment.fraud.approved.v1'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], SagaConsumer.prototype, "handleFraudApproved", null);
__decorate([
    (0, microservices_1.EventPattern)('payment.ledger.written.v1'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], SagaConsumer.prototype, "handleLedgerWritten", null);
__decorate([
    (0, microservices_1.EventPattern)('payment.failed.v1'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], SagaConsumer.prototype, "handlePaymentFailed", null);
exports.SagaConsumer = SagaConsumer = SagaConsumer_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_1.DataSource !== "undefined" && typeorm_1.DataSource) === "function" ? _a : Object, typeof (_b = typeof processed_events_repository_1.ProcessedEventsRepository !== "undefined" && processed_events_repository_1.ProcessedEventsRepository) === "function" ? _b : Object])
], SagaConsumer);


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(1);
const consumers_module_1 = __webpack_require__(2);
const microservices_1 = __webpack_require__(4);
async function bootstrap() {
    const app = await core_1.NestFactory.createMicroservice(consumers_module_1.ConsumersModule, {
        transport: microservices_1.Transport.KAFKA,
        options: {
            client: {
                brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
            },
            consumer: {
                groupId: 'consumers-main-group',
            },
            subscribe: {
                fromBeginning: true,
            }
        },
    });
    await app.listen();
    console.log('Payment Consumers microservice is listening for Kafka events.');
}
bootstrap();

})();

/******/ })()
;
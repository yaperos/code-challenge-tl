import { AppService } from './app.service';
import { KafkaTypedProducer } from './kafka-typed-producer';
import type { EventContract } from './types/event-contract.type';
type PaymentCreatedPayload = {
    paymentId: string;
    amount: number;
    currency: 'PEN' | 'MXN' | 'USD';
    fromCountry: string;
};
export declare class AppController {
    private readonly appService;
    private readonly producer;
    private readonly logger;
    readonly maxRetries = 2;
    constructor(appService: AppService, producer: KafkaTypedProducer);
    getHello(): string;
    testPublish(body: any): Promise<{
        status: string;
    }>;
    handlePaymentCreated(event: EventContract<PaymentCreatedPayload>): Promise<void>;
}
export {};

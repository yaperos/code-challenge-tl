import { Controller, Get, Post, Body, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { KafkaTypedProducer } from './kafka-typed-producer'; // Simulating @yape/kafka-module
import { KafkaEvent } from './decorators/kafka-event.decorator';
import type { EventContract } from './types/event-contract.type';

// The interface required by the squad
type PaymentCreatedPayload = {
  paymentId: string;
  amount: number;
  currency: 'PEN' | 'MXN' | 'USD';
  fromCountry: string;
}

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  
  // Demonstrating how instance variables can be read by our Explorer (maxRetries)
  public readonly maxRetries = 2;

  constructor(
    private readonly appService: AppService,
    private readonly producer: KafkaTypedProducer,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/test-publish')
  async testPublish(@Body() body: any) {
    // Demostrando validación Type-Safe EventContract<T> en Tiempo de Compilación
    await this.producer.publish<PaymentCreatedPayload>('payment.created.v1', {
      eventId: Math.random().toString(),
      eventType: 'payment.created.v1',
      version: 1,
      producer: 'squad-payments',
      occurredAt: new Date().toISOString(),
      data: {
        paymentId: 'PAY-123456',
        amount: body.amount || 100,
        currency: 'PEN', // Si cambias esto a 'EUR', Fallará en tiempo de compilación Typescript
        fromCountry: 'PE',
      },
    });

    return { status: 'published' };
  }

  // Consumer Method
  @KafkaEvent('payment.created.v1')
  async handlePaymentCreated(event: EventContract<PaymentCreatedPayload>): Promise<void> {
    this.logger.log(`Received Kafka Event in Squad Consumer: ${JSON.stringify(event.data)}`);
    
    // Provocar fallo condicional para probar DLT
    if (event.data.amount > 1000) {
      this.logger.error('Amount too high! Simulating crash to trigger DLT handler...');
      throw new Error('Amount exceeds maximum allowed limit. Simulating failure.');
    }
  }
}

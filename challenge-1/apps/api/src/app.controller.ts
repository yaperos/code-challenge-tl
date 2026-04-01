import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { CreatePaymentDto } from '@app/shared';

@Controller('payments')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    const payment = await this.appService.createPayment(createPaymentDto);
    return payment;
  }

  // GET /payments/:id
  // CONSISTENCY GUARANTEE: This endpoint reflects eventual consistency.
  // A payment may return `pending` after creation.
  // It transitions to `settled` only after BOTH FraudConsumer AND LedgerConsumer
  // have acknowledged the event. There is no SLA on this window.
  @Get(':id')
  async getPayment(@Param('id') id: string) {
    const payment = await this.appService.getPayment(id);
    return {
      data: {
        paymentId: payment.id,
        status: payment.status, // 'pending' | 'settled' | 'failed'
        amount: payment.amount,
        currency: payment.currency,
      },
      meta: {
        consistencyModel: 'eventual',
        note: 'Status may be pending while downstream consumers are processing.',
      },
    };
  }
}

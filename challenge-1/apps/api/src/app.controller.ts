import { Controller, Get, Post, Body, Param, Query, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { CreatePaymentDto, PaginationDto } from '@app/shared';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('payments')
@UseInterceptors(CacheInterceptor)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    const payment = await this.appService.createPayment(createPaymentDto);
    return payment;
  }

  @Get()
  async getPayments(@Query() paginationDto: PaginationDto) {
    return this.appService.getPayments(paginationDto);
  }

  // GET /payments/:id
  // CONSISTENCY GUARANTEE: This endpoint reflects eventual consistency.
  @Get(':id')
  async getPayment(@Param('id') id: string) {
    const payment = await this.appService.getPayment(id);
    return {
      data: {
        paymentId: payment.id,
        status: payment.status,
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

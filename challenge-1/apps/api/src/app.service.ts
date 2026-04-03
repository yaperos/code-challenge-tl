import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Payment, PaymentStatus, OutboxEvent, OutboxStatus, CreatePaymentDto } from '@app/shared';
import { v4 as uuidv4 } from 'uuid';
import { PaymentsRepository, PaginationOptions } from './payments/payments.repository';

@Injectable()
export class AppService {
  constructor(
    private dataSource: DataSource,
    private paymentsRepository: PaymentsRepository,
  ) {}

  async createPayment(dto: CreatePaymentDto) {
    const { amount, currency, country } = dto;
    const paymentId = uuidv4();
    const eventId = uuidv4();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let payment: Payment;

    try {
      payment = queryRunner.manager.create(Payment, {
        id: paymentId,
        amount,
        currency,
        country,
        status: PaymentStatus.PENDING,
      });

      await queryRunner.manager.save(payment);

      const outboxEvent = queryRunner.manager.create(OutboxEvent, {
        eventId,
        aggregateId: paymentId,
        eventType: 'payment.created.v1',
        payload: {
          id: paymentId,
          amount,
          currency,
          country,
        },
        status: OutboxStatus.PENDING,
      });

      await queryRunner.manager.save(outboxEvent);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    return payment;
  }

  async getPayment(id: string) {
    const payment = await this.paymentsRepository.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async getPayments(options: PaginationOptions) {
    return this.paymentsRepository.findPaginated(options);
  }
}

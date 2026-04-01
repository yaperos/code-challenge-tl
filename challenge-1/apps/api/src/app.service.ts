import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Payment, PaymentStatus, OutboxEvent, OutboxStatus, CreatePaymentDto } from '@app/shared';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AppService {
  constructor(private dataSource: DataSource) {}

  async createPayment(dto: CreatePaymentDto) {
    const paymentId = uuidv4();
    const eventId = uuidv4();

    // Outbox Pattern via explicit QueryRunner to handle transaction safely
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let payment: Payment;

    try {
      payment = queryRunner.manager.create(Payment, {
        id: paymentId,
        amount: dto.amount,
        currency: dto.currency,
        country: dto.country,
        status: PaymentStatus.PENDING,
      });

      await queryRunner.manager.save(payment);

      const outboxEvent = queryRunner.manager.create(OutboxEvent, {
        eventId,
        aggregateId: paymentId,
        eventType: 'payment.created.v1',
        payload: {
          id: paymentId,
          amount: dto.amount,
          currency: dto.currency,
          country: dto.country,
        },
        status: OutboxStatus.PENDING,
      });

      await queryRunner.manager.save(outboxEvent);

      // NO Kafka emission here
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
    const payment = await this.dataSource.manager.findOne(Payment, { where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }
}

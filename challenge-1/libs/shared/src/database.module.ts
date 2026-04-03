import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { OutboxEvent } from './entities/outbox-event.entity';
import { ProcessedEvent } from './entities/processed-event.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'user',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'payments_db',
      entities: [Payment, OutboxEvent, ProcessedEvent],
      synchronize: true, // Auto-create tables for the challenge (Not for production)
    }),
    TypeOrmModule.forFeature([Payment, OutboxEvent, ProcessedEvent]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}

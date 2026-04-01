import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DatabaseModule } from '@app/shared';
import { FraudConsumer } from './fraud.consumer';
import { LedgerConsumer } from './ledger.consumer';
import { SagaConsumer } from './saga.consumer';
import { ProcessedEventsRepository } from './processed-events.repository';

@Module({
  imports: [
    DatabaseModule,
    ClientsModule.register([
      {
        name: 'KAFKA_CLIENT',
        transport: Transport.KAFKA,
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
    FraudConsumer, 
    LedgerConsumer, 
    SagaConsumer, 
    ProcessedEventsRepository
  ],
})
export class ConsumersModule {}

import { Module, OnModuleInit, Inject } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport, ClientKafka } from '@nestjs/microservices';
import { DatabaseModule } from '@app/shared';
import { DispatcherController } from './dispatcher.controller';
import { FraudConsumer } from './fraud.consumer';
import { LedgerConsumer } from './ledger.consumer';
import { SagaConsumer } from './saga.consumer';
import { NotifyConsumer } from './notify.consumer';
import { ProcessedEventsRepository } from './processed-events.repository';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  controllers: [
    DispatcherController,
    SagaConsumer,
    NotifyConsumer,
  ],
  providers: [
    FraudConsumer, 
    LedgerConsumer, 
    ProcessedEventsRepository
  ],
})
export class ConsumersModule implements OnModuleInit {
  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    // Explicitly connect to Kafka to avoid "no leader" errors on the first emit
    await this.kafkaClient.connect();
    console.log('Kafka Client connected in ConsumersModule');
  }
}

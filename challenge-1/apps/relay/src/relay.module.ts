import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RelayService } from './relay.service';
import { DatabaseModule } from '@app/shared';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    DatabaseModule,
    ScheduleModule.forRoot(),
    ClientsModule.register([
      {
        name: 'KAFKA_CLIENT',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'outbox-relay',
            brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
          },
          producerOnlyMode: true,
        },
      },
    ]),
  ],
  providers: [RelayService],
})
export class RelayModule {}

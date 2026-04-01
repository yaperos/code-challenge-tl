import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KafkaModule } from './kafka.module'; // Simulando el module '@yape/kafka-module'

@Module({
  imports: [
    KafkaModule.forFeature({
      topics: ['payment.created.v1'],
      consumerGroup: 'payments-service-cg',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

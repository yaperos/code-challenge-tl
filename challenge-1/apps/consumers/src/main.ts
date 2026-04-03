import { NestFactory } from '@nestjs/core';
import { ConsumersModule } from './consumers.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(ConsumersModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
      },
      consumer: {
        groupId: 'consumers-main-group',
      },
      subscribe: {
        fromBeginning: true,
      }
    },
  });

  await app.listen();
  console.log('Payment Consumers microservice is listening for Kafka events.');
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { RelayModule } from './relay.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(RelayModule);
  // It's a worker, so no HTTP server listening
  console.log('Outbox Relay Worker started');
}
bootstrap();

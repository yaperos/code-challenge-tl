import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, KafkaContext } from '@nestjs/microservices';
import { FraudConsumer } from './fraud.consumer';
import { LedgerConsumer } from './ledger.consumer';

@Controller()
export class DispatcherController {
  private readonly logger = new Logger(DispatcherController.name);

  constructor(
    private readonly fraud: FraudConsumer,
    private readonly ledger: LedgerConsumer,
  ) {}

  @EventPattern([
    'pe.payment.created.v1',
    'mx.payment.created.v1',
    'co.payment.created.v1',
    'gen.payment.created.v1'
  ])
  async handlePaymentCreated(@Payload() message: any, @Ctx() context: KafkaContext) {
    this.logger.log('Payment created event received by Dispatcher');
    // Run both checks concurrently
    Promise.allSettled([
      this.fraud.handlePaymentCreated(message, context),
      this.ledger.handlePaymentCreated(message, context),
    ]).then(() => {
      this.logger.log('Fraud and Ledger evaluations initiated');
    });
  }
}

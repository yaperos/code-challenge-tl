import { Injectable, Inject, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { OutboxEvent, OutboxStatus } from '@app/shared';

@Injectable()
export class RelayService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RelayService.name);

  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka,
    private readonly dataSource: DataSource,
  ) {}

  async onApplicationBootstrap() {
    await this.kafkaClient.connect();
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async relayOutboxEvents() {
    this.logger.debug('Running Outbox Relay...');

    // In a real distributed env, we might want to use SELECT ... FOR UPDATE SKIP LOCKED
    // Here we use queryRunner to do standard transactions if needed,
    // or just fetch locally to keep it simple as we only have 1 relay process.
    
    const events = await this.dataSource.manager.find(OutboxEvent, {
      where: { status: OutboxStatus.PENDING },
      take: 100,
      order: { createdAt: 'ASC' },
    });

    if (events.length === 0) return;

    this.logger.log(`Found ${events.length} pending events to relay`);

    for (const event of events) {
      try {
        await new Promise((resolve, reject) => {
          this.kafkaClient.emit(event.eventType, {
            key: event.aggregateId, 
            value: event.payload 
          }).subscribe({
            next: (val) => resolve(val),
            error: (err) => reject(err),
          });
        });

        event.status = OutboxStatus.SENT;
        event.sentAt = new Date();
        await this.dataSource.manager.save(event);
        
        this.logger.log(`Relayed event ${event.eventId} successfully`);
      } catch (error) {
        this.logger.error(`Failed to relay event ${event.eventId}`, error.stack);
        event.retryCount += 1;
        await this.dataSource.manager.save(event);
      }
    }
  }
}

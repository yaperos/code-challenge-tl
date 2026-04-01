import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProcessedEvent } from '@app/shared';

@Injectable()
export class ProcessedEventsRepository {
  constructor(private readonly dataSource: DataSource) {}

  async exists(eventId: string, consumer: string): Promise<boolean> {
    const record = await this.dataSource.manager.findOne(ProcessedEvent, {
      where: { eventId, consumer },
    });
    return !!record;
  }

  async markProcessed(eventId: string, consumer: string): Promise<void> {
    const record = this.dataSource.manager.create(ProcessedEvent, {
      eventId,
      consumer,
    });
    await this.dataSource.manager.save(record);
  }
}

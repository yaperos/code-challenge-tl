import { Entity, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('processed_events')
export class ProcessedEvent {
  @PrimaryColumn('uuid')
  eventId: string;

  @PrimaryColumn({ length: 50 })
  consumer: string;

  @CreateDateColumn({ type: 'timestamptz' })
  processedAt: Date;
}

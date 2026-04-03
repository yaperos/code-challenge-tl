import { Entity, Column, PrimaryColumn, CreateDateColumn, Index } from 'typeorm';

export enum OutboxStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

@Entity('outbox_events')
@Index('idx_outbox_status', ['status', 'createdAt'])
export class OutboxEvent {
  @PrimaryColumn('uuid')
  eventId: string;

  @Column('uuid')
  aggregateId: string;

  @Column({ length: 100 })
  eventType: string;

  @Column('jsonb')
  payload: Record<string, any>;

  @Column({
    type: 'enum',
    enum: OutboxStatus,
    default: OutboxStatus.PENDING,
  })
  status: OutboxStatus;

  @Column({ default: 0 })
  retryCount: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  sentAt: Date;
}

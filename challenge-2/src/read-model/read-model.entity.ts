import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('transfer_read_model')
export class TransferReadModel {
  @PrimaryColumn()
  transferId: string;

  @Column()
  status: string;

  @Column({ nullable: true })
  fromWallet: string;

  @Column({ nullable: true })
  toWallet: string;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  amount: number;

  @Column({ nullable: true })
  failureReason: string;

  @Column()
  lastEventVersion: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

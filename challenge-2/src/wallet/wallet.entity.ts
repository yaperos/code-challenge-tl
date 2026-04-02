import { Entity, Column, PrimaryGeneratedColumn, VersionColumn, PrimaryColumn } from 'typeorm';

@Entity('wallets')
export class Wallet {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  balance: number;

  @Column({ length: 3 })
  currency: string;

  // Optimistic locking for safety outside raw SQL if needed,
  // but we will primarily use raw SQL version updates and pessimistic locking.
  @VersionColumn()
  version: number;
}

@Entity('debit_records')
export class DebitRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  transferId: string;

  @Column()
  walletId: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}

@Entity('reversal_records')
export class ReversalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  transferId: string;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}

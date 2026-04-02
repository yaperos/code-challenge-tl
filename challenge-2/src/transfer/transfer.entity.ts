import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, VersionColumn } from 'typeorm';

export enum SagaStep {
  STARTED = 'STARTED',
  DEBIT_COMPLETED = 'DEBIT_COMPLETED',
  CREDIT_COMPLETED = 'CREDIT_COMPLETED',
  FX_SETTLED = 'FX_SETTLED',
  FX_AMBIGUOUS = 'FX_AMBIGUOUS',
  COMPLETED = 'COMPLETED',
  COMPENSATING = 'COMPENSATING',
  FAILED = 'FAILED',
}

export class TransferDto {
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  fromCurrency: string;
  toCurrency: string;
}

@Entity('transfer_sagas')
export class TransferSaga {
  @PrimaryColumn()
  transferId: string;

  @Column({ type: 'varchar', length: 30, default: SagaStep.STARTED })
  step: SagaStep;

  @Column({ type: 'jsonb' })
  dto: TransferDto;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @VersionColumn()
  version: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

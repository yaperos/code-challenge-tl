import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Wallet, DebitRecord, ReversalRecord } from './wallet.entity';

export class InsufficientFundsError extends Error {}
export class ConcurrentModificationError extends Error {}

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(DebitRecord)
    private readonly debitRepo: Repository<DebitRecord>,
    @InjectRepository(ReversalRecord)
    private readonly reversalRepo: Repository<ReversalRecord>,
    private readonly dataSource: DataSource,
  ) {}

  async debit(transferId: string, walletId: string, amount: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Optimistic locking + Pessimistic: SELECT ... FOR UPDATE previene race condition
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { id: walletId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) throw new Error('Wallet not found');

      if (wallet.balance < amount) {
        throw new InsufficientFundsError(
          `Wallet ${walletId} has insufficient funds. Balance: ${wallet.balance}, Required: ${amount}`,
        );
      }

      // Versioned update
      const result = await queryRunner.manager
        .createQueryBuilder()
        .update(Wallet)
        .set({
          balance: () => `balance - ${amount}`,
          version: () => `version + 1`,
        })
        .where('id = :id AND version = :version AND balance >= :amount', {
          id: walletId,
          version: wallet.version,
          amount,
        })
        .execute();

      if (result.affected === 0) {
        throw new ConcurrentModificationError(`Concurrent debit detected on wallet ${walletId}`);
      }

      // Guardar registro para posible idempotencia / reversión
      await queryRunner.manager.save(DebitRecord, {
        transferId,
        walletId,
        amount,
      });

      await queryRunner.commitTransaction();
      this.logger.log(`Debited ${amount} from wallet ${walletId} for transfer ${transferId}`);
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async credit(transferId: string, walletId: string, amount: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Avoid duplicate credits logic if needed, but for the challenge scope credit is simple
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { id: walletId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) throw new Error('Wallet not found');

      await queryRunner.manager
        .createQueryBuilder()
        .update(Wallet)
        .set({
          balance: () => `balance + ${amount}`,
          version: () => `version + 1`,
        })
        .where('id = :id AND version = :version', {
          id: walletId,
          version: wallet.version,
        })
        .execute();

      await queryRunner.commitTransaction();
      this.logger.log(`Credited ${amount} to wallet ${walletId} for transfer ${transferId}`);
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  // Compensación idempotente
  async reverseDebit(transferId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verificamos si ya fue revertido en este queryRunner
      const alreadyReversed = await queryRunner.manager.findOne(ReversalRecord, {
        where: { transferId },
        lock: { mode: 'pessimistic_write' },
      });

      if (alreadyReversed) {
         await queryRunner.rollbackTransaction();
         return; // Idempotente
      }

      const debitRecord = await queryRunner.manager.findOne(DebitRecord, {
        where: { transferId },
      });

      if (!debitRecord) {
         // Si no hay debito, no hay nada que revertir
         await queryRunner.rollbackTransaction();
         return;
      }

      // Aplicar el reverse
      await queryRunner.manager.increment(Wallet, { id: debitRecord.walletId }, 'balance', debitRecord.amount);
      await queryRunner.manager.save(ReversalRecord, { transferId });

      await queryRunner.commitTransaction();
      this.logger.warn(`Reversed debit for transfer ${transferId}`);
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
}

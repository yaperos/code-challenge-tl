import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransferReadModel } from './read-model.entity';
import { TransferStartedEvent, TransferCompletedEvent, TransferFailedEvent } from '../shared/events/transfer.events';

@Injectable()
export class TransferReadModelProjector {
  private readonly logger = new Logger(TransferReadModelProjector.name);

  constructor(
    @InjectRepository(TransferReadModel)
    private readonly repo: Repository<TransferReadModel>,
  ) {}

  @OnEvent('TransferStartedEvent')
  async onStarted(event: TransferStartedEvent): Promise<void> {
    this.logger.debug(`Projecting TransferStartedEvent for ${event.transferId}`);
    const existing = await this.repo.findOne({ where: { transferId: event.transferId } });
    
    // Evitar procesar eventos obsoletos
    if (existing && existing.lastEventVersion >= event.version) return;

    await this.repo.save({
      transferId: event.transferId,
      status: 'pending',
      fromWallet: event.fromWalletId,
      toWallet: event.toWalletId,
      amount: event.amount,
      lastEventVersion: event.version,
    });
  }

  @OnEvent('TransferCompletedEvent')
  async onCompleted(event: TransferCompletedEvent): Promise<void> {
    this.logger.debug(`Projecting TransferCompletedEvent for ${event.transferId}`);
    const existing = await this.repo.findOne({ where: { transferId: event.transferId } });
    if (existing && existing.lastEventVersion >= event.version) return;

    await this.repo.save({
      transferId: event.transferId,
      status: 'completed',
      lastEventVersion: event.version,
    });
  }

  @OnEvent('TransferFailedEvent')
  async onFailed(event: TransferFailedEvent): Promise<void> {
    this.logger.debug(`Projecting TransferFailedEvent for ${event.transferId}`);
    const existing = await this.repo.findOne({ where: { transferId: event.transferId } });
    if (existing && existing.lastEventVersion >= event.version) return;

    await this.repo.save({
      transferId: event.transferId,
      status: 'failed',
      failureReason: event.reason,
      lastEventVersion: event.version,
    });
  }
}

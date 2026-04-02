import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SagaRepository } from './saga.repository';
import { SagaStep, TransferDto } from './transfer.entity';
import { WalletService } from '../wallet/wallet.service';
import { FxService, TimeoutError } from '../fx/fx.service';
import { TransferStartedEvent, TransferCompletedEvent, TransferFailedEvent } from '../shared/events/transfer.events';

@Injectable()
export class TransferOrchestrator {
  private readonly logger = new Logger(TransferOrchestrator.name);

  constructor(
    private readonly sagaRepo: SagaRepository,
    private readonly walletService: WalletService,
    private readonly fxService: FxService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // Idempotency key en la INSTANCIA de saga
  async startTransfer(transferId: string, dto: TransferDto): Promise<void> {
    const existing = await this.sagaRepo.findById(transferId);
    if (existing) {
      if (existing.step !== SagaStep.COMPLETED && existing.step !== SagaStep.FAILED && existing.step !== SagaStep.FX_AMBIGUOUS) {
        this.logger.log(`Resuming saga ${transferId} from step ${existing.step}`);
        await this.execute(transferId);
      }
      return;
    }

    const saga = await this.sagaRepo.create({ transferId, step: SagaStep.STARTED, dto });
    
    // Emitir para el read model CQRS
    this.eventEmitter.emit('TransferStartedEvent', new TransferStartedEvent(transferId, dto.fromWalletId, dto.toWalletId, dto.amount, saga.version));

    await this.execute(transferId);
  }

  async execute(transferId: string): Promise<void> {
    const saga = await this.sagaRepo.findById(transferId);
    if (!saga) return;

    try {
      if (saga.step === SagaStep.STARTED) {
        await this.walletService.debit(transferId, saga.dto.fromWalletId, saga.dto.amount);
        await this.sagaRepo.updateStep(transferId, SagaStep.DEBIT_COMPLETED);
        saga.step = SagaStep.DEBIT_COMPLETED;
      }
      
      if (saga.step === SagaStep.DEBIT_COMPLETED) {
        await this.walletService.credit(transferId, saga.dto.toWalletId, saga.dto.amount);
        await this.sagaRepo.updateStep(transferId, SagaStep.CREDIT_COMPLETED);
        saga.step = SagaStep.CREDIT_COMPLETED;
      }
      
      if (saga.step === SagaStep.CREDIT_COMPLETED) {
        await this.fxService.settle(transferId, saga.dto.fromCurrency, saga.dto.toCurrency, saga.dto.amount);
        await this.sagaRepo.updateStep(transferId, SagaStep.FX_SETTLED);
        saga.step = SagaStep.FX_SETTLED;
      }
      
      if (saga.step === SagaStep.FX_SETTLED) {
        // Receipt service emit o just completion
        await this.sagaRepo.updateStep(transferId, SagaStep.COMPLETED);
        saga.step = SagaStep.COMPLETED;
        this.eventEmitter.emit('TransferCompletedEvent', new TransferCompletedEvent(transferId, saga.version + 4)); // +4 para simular incremento de version por steps
        this.logger.log(`Transfer ${transferId} COMPLETED successfully.`);
      }
    } catch (error) {
      if (error instanceof TimeoutError) {
        // Escalation: FX state is ambiguous, manual review needed, DO NOT compensate.
        await this.sagaRepo.updateStep(transferId, SagaStep.FX_AMBIGUOUS);
        this.logger.error(`Transfer ${transferId} is in FX_AMBIGUOUS state. Needs manual intervention.`);
        return;
      }
      await this.compensate(transferId, saga.step, error as Error);
    }
  }

  private async compensate(transferId: string, failedAt: SagaStep, error: Error): Promise<void> {
    this.logger.warn(`Compensating saga ${transferId} that failed at ${failedAt}: ${error.message}`);
    await this.sagaRepo.updateStep(transferId, SagaStep.COMPENSATING);

    if (failedAt === SagaStep.CREDIT_COMPLETED || failedAt === SagaStep.DEBIT_COMPLETED) {
      // Revertir débito que ya se ejecutó correctamente
      await this.walletService.reverseDebit(transferId);
    }

    await this.sagaRepo.updateStep(transferId, SagaStep.FAILED, error.message);
    const updatedSaga = await this.sagaRepo.findById(transferId);
    this.eventEmitter.emit('TransferFailedEvent', new TransferFailedEvent(transferId, error.message, updatedSaga?.version || 0));
  }
}

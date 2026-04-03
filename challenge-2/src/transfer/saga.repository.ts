import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransferSaga, SagaStep, TransferDto } from './transfer.entity';

@Injectable()
export class SagaRepository {
  constructor(
    @InjectRepository(TransferSaga)
    private readonly repo: Repository<TransferSaga>,
  ) {}

  async findById(transferId: string): Promise<TransferSaga | null> {
    return this.repo.findOne({ where: { transferId } });
  }

  async create(data: { transferId: string; step: SagaStep; dto: TransferDto }): Promise<TransferSaga> {
    const saga = this.repo.create(data);
    return this.repo.save(saga);
  }

  async updateStep(transferId: string, step: SagaStep, errorMessage?: string): Promise<void> {
    await this.repo.update({ transferId }, { step, errorMessage });
  }
}

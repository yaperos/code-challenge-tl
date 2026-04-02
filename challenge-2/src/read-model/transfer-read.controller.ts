import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransferReadModel } from './read-model.entity';

@Controller('transfers')
export class TransferReadController {
  constructor(
    @InjectRepository(TransferReadModel)
    private readonly readRepo: Repository<TransferReadModel>,
  ) {}

  @Get(':id')
  async getTransfer(@Param('id') id: string) {
    const transfer = await this.readRepo.findOne({ where: { transferId: id } });
    if (!transfer) {
      throw new NotFoundException(`Transfer ${id} not found`);
    }

    return {
      data: transfer,
      meta: {
        consistencyModel: 'eventual',
        stalenessWindowMs: 500,
        note: 'Read model is updated via projected events. Status reflects last known state.',
      },
    };
  }
}

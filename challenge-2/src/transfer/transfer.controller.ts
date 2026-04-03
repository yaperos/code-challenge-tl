import { Controller, Post, Body, Param } from '@nestjs/common';
import { TransferOrchestrator } from './transfer.orchestrator';
import { TransferDto } from './transfer.entity';

@Controller('transfers')
export class TransferController {
  constructor(private readonly orchestrator: TransferOrchestrator) {}

  @Post(':id')
  async createTransfer(@Param('id') transferId: string, @Body() dto: TransferDto) {
    // Iniciamos la saga asincrónicamente para respuesta rápida (202 Accepted style)
    this.orchestrator.startTransfer(transferId, dto).catch(console.error);
    return {
      message: 'Transfer saga initiated',
      transferId,
    };
  }
}

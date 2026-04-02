import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransferSaga } from './transfer.entity';
import { SagaRepository } from './saga.repository';
import { TransferOrchestrator } from './transfer.orchestrator';
import { TransferController } from './transfer.controller';
import { WalletModule } from '../wallet/wallet.module';
import { FxModule } from '../fx/fx.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransferSaga]),
    WalletModule,
    FxModule,
  ],
  controllers: [TransferController],
  providers: [SagaRepository, TransferOrchestrator],
})
export class TransferModule {}

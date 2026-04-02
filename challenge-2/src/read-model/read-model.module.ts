import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransferReadModel } from './read-model.entity';
import { TransferReadController } from './transfer-read.controller';
import { TransferReadModelProjector } from './transfer-read-model.projector';

@Module({
  imports: [TypeOrmModule.forFeature([TransferReadModel])],
  controllers: [TransferReadController],
  providers: [TransferReadModelProjector],
})
export class ReadModelModule {}

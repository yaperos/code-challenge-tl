import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TransferModule } from './transfer/transfer.module';
import { WalletModule } from './wallet/wallet.module';
import { FxModule } from './fx/fx.module';
import { ReadModelModule } from './read-model/read-model.module';

import { Wallet, DebitRecord, ReversalRecord } from './wallet/wallet.entity';
import { TransferSaga } from './transfer/transfer.entity';
import { TransferReadModel } from './read-model/read-model.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: 5432,
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'password',
      database: process.env.POSTGRES_DB || 'yape_transfer',
      entities: [
        Wallet,
        DebitRecord,
        ReversalRecord,
        TransferSaga,
        TransferReadModel,
      ],
      synchronize: true, // Auto-create tables for dev challenge
      logging: ['query', 'error'],
    }),
    EventEmitterModule.forRoot(),
    TransferModule,
    WalletModule,
    FxModule,
    ReadModelModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

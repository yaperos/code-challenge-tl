import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './wallet.entity';

@Controller('wallets')
export class WalletController {
  constructor(
    @InjectRepository(Wallet)
    private readonly repo: Repository<Wallet>,
  ) {}

  @Post()
  async create(@Body() data: { id: string; balance: number; currency: string }) {
    const wallet = this.repo.create(data);
    return this.repo.save(wallet);
  }

  @Post('seed')
  async seed() {
    await this.repo.save([
      { id: 'W-A', balance: 1000, currency: 'USD', version: 1 },
      { id: 'W-B', balance: 0, currency: 'USD', version: 1 },
    ]);
    return { message: 'Wallets W-A and W-B seeded' };
  }

  @Get()
  async findAll() {
    return this.repo.find();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.repo.findOne({ where: { id } });
  }
}

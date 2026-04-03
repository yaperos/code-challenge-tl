import { Controller, Get } from '@nestjs/common';
import { ConsumersService } from './consumers.service';

@Controller()
export class ConsumersController {
  constructor(private readonly consumersService: ConsumersService) {}

  @Get()
  getHello(): string {
    return this.consumersService.getHello();
  }
}

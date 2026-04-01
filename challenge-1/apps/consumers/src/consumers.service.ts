import { Injectable } from '@nestjs/common';

@Injectable()
export class ConsumersService {
  getHello(): string {
    return 'Hello World!';
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { ConsumersController } from './consumers.controller';
import { ConsumersService } from './consumers.service';

describe('ConsumersController', () => {
  let consumersController: ConsumersController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ConsumersController],
      providers: [ConsumersService],
    }).compile();

    consumersController = app.get<ConsumersController>(ConsumersController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(consumersController.getHello()).toBe('Hello World!');
    });
  });
});

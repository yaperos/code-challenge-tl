import { Test, TestingModule } from '@nestjs/testing';
import { RelayController } from './relay.controller';
import { RelayService } from './relay.service';

describe('RelayController', () => {
  let relayController: RelayController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [RelayController],
      providers: [RelayService],
    }).compile();

    relayController = app.get<RelayController>(RelayController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(relayController.getHello()).toBe('Hello World!');
    });
  });
});

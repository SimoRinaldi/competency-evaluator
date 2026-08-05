import { Test } from '@nestjs/testing';
import { ServerRubricsController } from './rubrics.controller';
import { ServerRubricsService } from './rubrics.service';

describe('ServerRubricsController', () => {
  let controller: ServerRubricsController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ServerRubricsService],
      controllers: [ServerRubricsController],
    }).compile();

    controller = module.get(ServerRubricsController);
  });

  it('should be defined', () => {
    expect(controller).toBeTruthy();
  });
});

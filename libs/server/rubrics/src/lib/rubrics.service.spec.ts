import { Test } from '@nestjs/testing';
import { ServerRubricsService } from './rubrics.service';

describe('ServerRubricsService', () => {
  let service: ServerRubricsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ServerRubricsService],
    }).compile();

    service = module.get(ServerRubricsService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });
});

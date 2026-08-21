import { Test, TestingModule } from '@nestjs/testing';
import { CompetencyService } from './competency.service';

describe('CompetencyService', () => {
  let service: CompetencyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompetencyService],
    }).compile();

    service = module.get<CompetencyService>(CompetencyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { SubCompetencyService } from './sub-competency.service';

describe('SubCompetencyService', () => {
  let service: SubCompetencyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubCompetencyService],
    }).compile();

    service = module.get<SubCompetencyService>(SubCompetencyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

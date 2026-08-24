import { Test, TestingModule } from '@nestjs/testing';
import { BestCompetencyScoreService } from './best-competency-score.service';
import { BestCompetencyScoreRepository } from './best-competency-score.repository';

describe('BestCompetencyScoreService', () => {
  let service: BestCompetencyScoreService;

  const mockRepository = {
    createOne: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUserAndCompetency: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BestCompetencyScoreService,
        {
          provide: BestCompetencyScoreRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BestCompetencyScoreService>(
      BestCompetencyScoreService
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

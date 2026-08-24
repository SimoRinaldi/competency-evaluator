import { Test, TestingModule } from '@nestjs/testing';
import { BestSubCompetencyScoreService } from './best-subcompetency-score.service';
import { BestSubCompetencyScoreRepository } from './best-subcompetency-score.repository';

describe('BestSubCompetencyScoreService', () => {
  let service: BestSubCompetencyScoreService;

  const mockRepository = {
    createOne: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUserAndSubCompetency: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BestSubCompetencyScoreService,
        {
          provide: BestSubCompetencyScoreRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BestSubCompetencyScoreService>(
      BestSubCompetencyScoreService
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

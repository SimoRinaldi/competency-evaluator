import { Test, TestingModule } from '@nestjs/testing';
import { BestCompetencyScoreController } from './best-competency-score.controller';
import { BestCompetencyScoreService } from './best-competency-score.service';

describe('BestCompetencyScoreController', () => {
  let controller: BestCompetencyScoreController;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BestCompetencyScoreController],
      providers: [
        {
          provide: BestCompetencyScoreService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<BestCompetencyScoreController>(
      BestCompetencyScoreController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

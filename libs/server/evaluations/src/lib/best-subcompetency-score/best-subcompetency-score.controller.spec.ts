import { Test, TestingModule } from '@nestjs/testing';
import { BestSubCompetencyScoreController } from './best-subcompetency-score.controller';
import { BestSubCompetencyScoreService } from './best-subcompetency-score.service';

describe('BestSubCompetencyScoreController', () => {
  let controller: BestSubCompetencyScoreController;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BestSubCompetencyScoreController],
      providers: [
        {
          provide: BestSubCompetencyScoreService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<BestSubCompetencyScoreController>(
      BestSubCompetencyScoreController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

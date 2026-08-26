import { Test, TestingModule } from '@nestjs/testing';
import { CompetencyController } from './competency.controller';
import { CompetencyService } from './competency.service';

describe('CompetencyController', () => {
  let controller: CompetencyController;

  const mockService = {
    getCompetencies: jest.fn(),
    getOneCompetency: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    removeCompetency: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompetencyController],
      providers: [
        {
          provide: CompetencyService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<CompetencyController>(CompetencyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

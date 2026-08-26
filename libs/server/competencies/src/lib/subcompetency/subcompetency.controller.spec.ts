import { Test, TestingModule } from '@nestjs/testing';
import { SubCompetencyController } from './subcompetency.controller';
import { SubCompetencyService } from './subcompetency.service';

describe('SubCompetencyController', () => {
  let controller: SubCompetencyController;

  const mockService = {
    getSubCompetencies: jest.fn(),
    getOneSubCompetency: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    removeSubCompetency: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubCompetencyController],
      providers: [
        {
          provide: SubCompetencyService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<SubCompetencyController>(
      SubCompetencyController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

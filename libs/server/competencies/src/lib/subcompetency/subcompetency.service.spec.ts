import { Test, TestingModule } from '@nestjs/testing';
import { SubCompetencyService } from './subcompetency.service';
import { SubCompetencyRepository } from './subcompetency.repository';

describe('SubCompetencyService', () => {
  let service: SubCompetencyService;

  const mockRepository = {
    findById: jest.fn(),
    findByTitle: jest.fn(),
    createOne: jest.fn(),
    findAll: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubCompetencyService,
        {
          provide: SubCompetencyRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SubCompetencyService>(SubCompetencyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

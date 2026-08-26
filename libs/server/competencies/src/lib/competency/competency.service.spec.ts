import { Test, TestingModule } from '@nestjs/testing';
import { CompetencyService } from './competency.service';
import { CompetencyRepository } from './competency.repository';

describe('CompetencyService', () => {
  let service: CompetencyService;

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
        CompetencyService,
        {
          provide: CompetencyRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CompetencyService>(CompetencyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

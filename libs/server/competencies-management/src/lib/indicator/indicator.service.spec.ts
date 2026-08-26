import { Test, TestingModule } from '@nestjs/testing';
import { IndicatorService } from './indicator.service';
import { IndicatorRepository } from './indicator.repository';

describe('IndicatorService', () => {
  let service: IndicatorService;

  const mockRepository = {
    createOne: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByIdWithRubricSet: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IndicatorService,
        {
          provide: IndicatorRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<IndicatorService>(IndicatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

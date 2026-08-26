import { Test, TestingModule } from '@nestjs/testing';
import { RubricService } from './rubric.service';
import { RubricRepository } from './rubric.repository';

describe('RubricService', () => {
  let service: RubricService;

  const mockRepository = {
    createOne: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RubricService,
        {
          provide: RubricRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<RubricService>(RubricService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

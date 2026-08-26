import { Test, TestingModule } from '@nestjs/testing';
import { TestExecutionService } from './test-execution.service';
import { TestExecutionRepository } from './test-execution.repository';
import { TestRepository } from '@server/test-management';
import { EvaluatedUsersRepository } from '@server/users';

describe('TestExecutionService', () => {
  let service: TestExecutionService;

  const mockTestExecutionRepository = {
    createOne: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUserAndTest: jest.fn(),
    findByEvaluatedUserId: jest.fn(),
    findByTestId: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
  };

  const mockTestRepository = {
    findById: jest.fn(),
  };

  const mockEvaluatedUsersRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestExecutionService,
        {
          provide: TestExecutionRepository,
          useValue: mockTestExecutionRepository,
        },
        {
          provide: TestRepository,
          useValue: mockTestRepository,
        },
        {
          provide: EvaluatedUsersRepository,
          useValue: mockEvaluatedUsersRepository,
        },
      ],
    }).compile();

    service = module.get<TestExecutionService>(TestExecutionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

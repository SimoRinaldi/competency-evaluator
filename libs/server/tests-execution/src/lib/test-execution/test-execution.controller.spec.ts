import { Test, TestingModule } from '@nestjs/testing';
import { TestExecutionController } from './test-execution.controller';
import { TestExecutionService } from './test-execution.service';

describe('TestExecutionController', () => {
  let controller: TestExecutionController;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByEvaluatedUser: jest.fn(),
    findByTest: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestExecutionController],
      providers: [
        {
          provide: TestExecutionService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<TestExecutionController>(
      TestExecutionController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

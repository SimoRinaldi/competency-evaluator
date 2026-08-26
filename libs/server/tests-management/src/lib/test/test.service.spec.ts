import { Test, TestingModule } from '@nestjs/testing';
import { TestService } from './test.service';
import { TestRepository } from './test.repository';
import { TestDesignersRepository } from '@server/users';

describe('TestService', () => {
  let service: TestService;

  const mockTestRepository = {
    createOne: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByTestDesignerId: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
  };

  const mockTestDesignersRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestService,
        {
          provide: TestRepository,
          useValue: mockTestRepository,
        },
        {
          provide: TestDesignersRepository,
          useValue: mockTestDesignersRepository,
        },
      ],
    }).compile();

    service = module.get<TestService>(TestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

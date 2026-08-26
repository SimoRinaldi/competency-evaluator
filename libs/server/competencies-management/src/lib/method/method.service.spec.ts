import { Test, TestingModule } from '@nestjs/testing';
import { MethodService } from './method.service';
import { MethodRepository } from './method.repository';

describe('MethodService', () => {
  let service: MethodService;

  const mockRepository = {
    findById: jest.fn(),
    findByName: jest.fn(),
    createOne: jest.fn(),
    findAll: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MethodService,
        {
          provide: MethodRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<MethodService>(MethodService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

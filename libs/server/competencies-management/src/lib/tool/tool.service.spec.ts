import { Test, TestingModule } from '@nestjs/testing';
import { ToolService } from './tool.service';
import { ToolRepository } from './tool.repository';

describe('ToolService', () => {
  let service: ToolService;

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
        ToolService,
        {
          provide: ToolRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ToolService>(ToolService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

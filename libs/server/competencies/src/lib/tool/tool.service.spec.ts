import { Test, TestingModule } from '@nestjs/testing';
import { ToolService } from './tool.service';
import { ToolRepository } from './tool.repository';

describe('ToolService', () => {
  let service: ToolService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToolService,
        {
          provide: ToolRepository,
          useValue: {
            findById: jest.fn(),
            findByName: jest.fn(),
            findAll: jest.fn(),
            createOne: jest.fn(),
            updateOne: jest.fn(),
            deleteOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ToolService>(ToolService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

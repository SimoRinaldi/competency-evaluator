import { Test, TestingModule } from '@nestjs/testing';
import { ToolController } from './tool.controller';
import { ToolService } from './tool.service';

describe('ToolController', () => {
  let controller: ToolController;

  const mockService = {
    getTools: jest.fn(),
    getOneTool: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    removeTool: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ToolController],
      providers: [
        {
          provide: ToolService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ToolController>(ToolController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { MethodController } from './method.controller';
import { MethodService } from './method.service';

describe('MethodController', () => {
  let controller: MethodController;

  const mockService = {
    getMethods: jest.fn(),
    getOneMethod: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    removeMethod: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MethodController],
      providers: [
        {
          provide: MethodService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<MethodController>(MethodController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

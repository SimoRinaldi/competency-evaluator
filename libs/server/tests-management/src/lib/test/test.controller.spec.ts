import { Test, TestingModule } from '@nestjs/testing';
import { TestController } from './test.controller';
import { TestService } from './test.service';

describe('TestController', () => {
  let controller: TestController;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByTestDesigner: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestController],
      providers: [
        {
          provide: TestService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<TestController>(TestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

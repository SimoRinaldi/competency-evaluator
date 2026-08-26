import { Test, TestingModule } from '@nestjs/testing';
import { RubricController } from './rubric.controller';
import { RubricService } from './rubric.service';

describe('RubricController', () => {
  let controller: RubricController;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RubricController],
      providers: [
        {
          provide: RubricService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<RubricController>(RubricController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

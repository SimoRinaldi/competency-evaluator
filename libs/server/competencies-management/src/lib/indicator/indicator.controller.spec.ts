import { Test, TestingModule } from '@nestjs/testing';
import { IndicatorController } from './indicator.controller';
import { IndicatorService } from './indicator.service';

describe('IndicatorController', () => {
  let controller: IndicatorController;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IndicatorController],
      providers: [
        {
          provide: IndicatorService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<IndicatorController>(IndicatorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

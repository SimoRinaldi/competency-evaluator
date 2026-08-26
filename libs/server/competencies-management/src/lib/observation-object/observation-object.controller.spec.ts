import { Test, TestingModule } from '@nestjs/testing';
import { ObservationObjectController } from './observation-object.controller';
import { ObservationObjectService } from './observation-object.service';

describe('ObservationObjectController', () => {
  let controller: ObservationObjectController;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ObservationObjectController],
      providers: [
        {
          provide: ObservationObjectService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ObservationObjectController>(
      ObservationObjectController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

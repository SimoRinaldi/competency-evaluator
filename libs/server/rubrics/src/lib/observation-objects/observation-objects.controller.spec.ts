import { Test, TestingModule } from '@nestjs/testing';
import { ObservationObjectsController } from './observation-objects.controller';
import { ObservationObjectsService } from './observation-objects.service';

describe('ObservationObjectsController', () => {
  let controller: ObservationObjectsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ObservationObjectsController],
      providers: [ObservationObjectsService],
    }).compile();

    controller = module.get<ObservationObjectsController>(
      ObservationObjectsController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

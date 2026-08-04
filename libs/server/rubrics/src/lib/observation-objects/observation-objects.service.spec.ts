import { Test, TestingModule } from '@nestjs/testing';
import { ObservationObjectsService } from './observation-objects.service';

describe('ObservationObjectsService', () => {
  let service: ObservationObjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ObservationObjectsService],
    }).compile();

    service = module.get<ObservationObjectsService>(ObservationObjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

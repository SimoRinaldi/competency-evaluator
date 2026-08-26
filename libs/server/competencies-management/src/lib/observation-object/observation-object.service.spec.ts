import { Test, TestingModule } from '@nestjs/testing';
import { ObservationObjectService } from './observation-object.service';
import { ObservationObjectRepository } from './observation-object.repository';

describe('ObservationObjectService', () => {
  let service: ObservationObjectService;

  const mockRepository = {
    createOne: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObservationObjectService,
        {
          provide: ObservationObjectRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ObservationObjectService>(
      ObservationObjectService
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

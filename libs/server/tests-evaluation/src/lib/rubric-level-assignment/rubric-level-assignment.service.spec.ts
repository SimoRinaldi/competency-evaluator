import { Test, TestingModule } from '@nestjs/testing';
import { IndicatorsService } from '@server/competencies-management';
import { RubricLevelAssignmentService } from './rubric-level-assignment.service';
import { RubricLevelAssignmentRepository } from './rubric-level-assignment.repository';

describe('RubricLevelAssignmentService', () => {
  let service: RubricLevelAssignmentService;

  const mockRepository = {
    createOne: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
    findDuplicateAssignment: jest.fn(),
    findByTestExecutionWithRelations: jest.fn(),
  };

  const mockIndicatorsService = {
    findByIdWithRubricSet: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RubricLevelAssignmentService,
        {
          provide: RubricLevelAssignmentRepository,
          useValue: mockRepository,
        },
        {
          provide: IndicatorsService,
          useValue: mockIndicatorsService,
        },
      ],
    }).compile();

    service = module.get<RubricLevelAssignmentService>(
      RubricLevelAssignmentService
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

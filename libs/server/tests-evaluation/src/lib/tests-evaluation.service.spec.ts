import { Test, TestingModule } from '@nestjs/testing';
import { TestsEvaluationService } from './tests-evaluation.service';
import { RubricLevelAssignmentService } from './rubric-level-assignment/rubric-level-assignment.service';
import {
  CompetencyHistoricalScoreService,
  SubCompetencyHistoricalScoreService,
} from '@server/historical-scores';
import { TestExecutionService } from '@server/tests-execution';

describe('TestsEvaluationService', () => {
  let service: TestsEvaluationService;

  const mockRubricLevelAssignmentService = {
    findByTestExecutionWithRelations: jest.fn(),
  };
  const mockSubCompetencyHistoricalScoreService = {
    findByUserAndSubCompetency: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const mockCompetencyHistoricalScoreService = {
    findByUserAndCompetency: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const mockTestExecutionService = {
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestsEvaluationService,
        {
          provide: RubricLevelAssignmentService,
          useValue: mockRubricLevelAssignmentService,
        },
        {
          provide: SubCompetencyHistoricalScoreService,
          useValue: mockSubCompetencyHistoricalScoreService,
        },
        {
          provide: CompetencyHistoricalScoreService,
          useValue: mockCompetencyHistoricalScoreService,
        },
        {
          provide: TestExecutionService,
          useValue: mockTestExecutionService,
        },
      ],
    }).compile();

    service = module.get<TestsEvaluationService>(
      TestsEvaluationService
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

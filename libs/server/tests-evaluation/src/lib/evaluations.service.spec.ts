import { Test, TestingModule } from '@nestjs/testing';
import { ServerTestsEvaluationService } from './evaluations.service';
import { RubricLevelAssignmentService } from './rubric-level-assignment/rubric-level-assignment.service';
import {
  CompetencyHistoricalScoreService,
  SubCompetencyHistoricalScoreService,
} from '@server/historical-scores';
import { ServerTestsExecutionService } from '@server/tests-execution';

describe('ServerTestsEvaluationService', () => {
  let service: ServerTestsEvaluationService;

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
  const mockTestExecutionsService = {
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServerTestsEvaluationService,
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
          provide: ServerTestsExecutionService,
          useValue: mockTestExecutionsService,
        },
      ],
    }).compile();

    service = module.get<ServerTestsEvaluationService>(
      ServerTestsEvaluationService
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

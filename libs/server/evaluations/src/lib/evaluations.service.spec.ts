import { Test, TestingModule } from '@nestjs/testing';
import { ServerEvaluationsService } from './evaluations.service';
import { RubricLevelAssignmentService } from './rubric-level-assignment/rubric-level-assignment.service';
import { BestSubCompetencyScoreService } from './best-subcompetency-score/best-subcompetency-score.service';
import { BestCompetencyScoreService } from './best-competency-score/best-competency-score.service';
import { ServerTestExecutionsService } from '@server/test-management';

describe('ServerEvaluationsService', () => {
  let service: ServerEvaluationsService;

  const mockRubricLevelAssignmentService = {
    findByTestExecutionWithRelations: jest.fn(),
  };
  const mockBestSubCompetencyScoreService = {
    findByUserAndSubCompetency: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const mockBestCompetencyScoreService = {
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
        ServerEvaluationsService,
        {
          provide: RubricLevelAssignmentService,
          useValue: mockRubricLevelAssignmentService,
        },
        {
          provide: BestSubCompetencyScoreService,
          useValue: mockBestSubCompetencyScoreService,
        },
        {
          provide: BestCompetencyScoreService,
          useValue: mockBestCompetencyScoreService,
        },
        {
          provide: ServerTestExecutionsService,
          useValue: mockTestExecutionsService,
        },
      ],
    }).compile();

    service = module.get<ServerEvaluationsService>(ServerEvaluationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

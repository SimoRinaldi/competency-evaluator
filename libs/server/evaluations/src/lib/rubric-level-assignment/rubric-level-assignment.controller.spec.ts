import { Test, TestingModule } from '@nestjs/testing';
import { RubricLevelAssignmentController } from './rubric-level-assignment.controller';
import { RubricLevelAssignmentService } from './rubric-level-assignment.service';

describe('RubricLevelAssignmentController', () => {
  let controller: RubricLevelAssignmentController;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RubricLevelAssignmentController],
      providers: [
        {
          provide: RubricLevelAssignmentService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<RubricLevelAssignmentController>(
      RubricLevelAssignmentController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

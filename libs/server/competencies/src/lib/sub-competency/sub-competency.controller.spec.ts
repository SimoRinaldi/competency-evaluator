import { Test, TestingModule } from '@nestjs/testing';
import { SubCompetencyController } from './sub-competency.controller';
import { SubCompetencyService } from './sub-competency.service';

describe('SubCompetencyController', () => {
  let controller: SubCompetencyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubCompetencyController],
      providers: [SubCompetencyService],
    }).compile();

    controller = module.get<SubCompetencyController>(SubCompetencyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

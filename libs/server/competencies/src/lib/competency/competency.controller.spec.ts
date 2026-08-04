import { Test, TestingModule } from '@nestjs/testing';
import { CompetencyController } from './competency.controller';
import { CompetencyService } from './competency.service';

describe('CompetencyController', () => {
  let controller: CompetencyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompetencyController],
      providers: [CompetencyService],
    }).compile();

    controller = module.get<CompetencyController>(CompetencyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

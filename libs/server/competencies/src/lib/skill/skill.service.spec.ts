import { Test, TestingModule } from '@nestjs/testing';
import { SkillService } from './skill.service';
import { SkillRepository } from './skill.repository';

describe('SkillService', () => {
  let service: SkillService;

  const mockRepository = {
    findById: jest.fn(),
    findByName: jest.fn(),
    createOne: jest.fn(),
    findAll: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillService,
        {
          provide: SkillRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SkillService>(SkillService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

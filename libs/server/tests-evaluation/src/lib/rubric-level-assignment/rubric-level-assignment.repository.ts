import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RubricLevelAssignmentEntity } from './entities/rubric-level-assignment.entity';
import { CreateRubricLevelAssignmentDto } from './dto/create-rubric-level-assignment.dto';
import { UpdateRubricLevelAssignmentDto } from './dto/update-rubric-level-assignment.dto';

@Injectable()
export class RubricLevelAssignmentRepository {
  constructor(
    @InjectRepository(RubricLevelAssignmentEntity)
    private readonly repository: Repository<RubricLevelAssignmentEntity>
  ) {}

  async createOne(
    dto: CreateRubricLevelAssignmentDto
  ): Promise<RubricLevelAssignmentEntity> {
    const rla = this.repository.create({
      rubric_rank: dto.rubric_rank,
      indicator_id: dto.indicator_id,
      test_execution_id: dto.test_execution_id,
      evaluator_id: dto.evaluator_id,
    });

    return this.repository.save(rla);
  }

  async findAll(): Promise<RubricLevelAssignmentEntity[]> {
    return this.repository.find({
      order: { id: 'ASC' },
      relations: ['indicator', 'test_execution', 'evaluator'],
    });
  }

  async findById(id: number): Promise<RubricLevelAssignmentEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['indicator', 'test_execution', 'evaluator'],
    });
  }

  async updateOne(
    rla: RubricLevelAssignmentEntity,
    dto: UpdateRubricLevelAssignmentDto
  ): Promise<RubricLevelAssignmentEntity> {
    if (dto.rubric_rank !== undefined) rla.rubric_rank = dto.rubric_rank;
    if (dto.indicator_id !== undefined) rla.indicator_id = dto.indicator_id;
    if (dto.test_execution_id !== undefined)
      rla.test_execution_id = dto.test_execution_id;
    if (dto.evaluator_id !== undefined) rla.evaluator_id = dto.evaluator_id;

    return this.repository.save(rla);
  }

  async deleteOne(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findDuplicateAssignment(
    indicator_id: number,
    test_execution_id: number,
    evaluator_id: number
  ): Promise<RubricLevelAssignmentEntity | null> {
    return this.repository.findOneBy({
      indicator_id,
      test_execution_id,
      evaluator_id,
    });
  }

  async findByTestExecutionWithRelations(
    test_execution_id: number
  ): Promise<RubricLevelAssignmentEntity[]> {
    return this.repository.find({
      where: { test_execution_id },
      relations: [
        'indicator',
        'indicator.observation_object',
        'indicator.observation_object.subcompetency',
        'indicator.observation_object.subcompetency.competency',
      ],
    });
  }

  async findByExecutionAndEvaluator(
    test_execution_id: number,
    evaluator_id: number
  ): Promise<RubricLevelAssignmentEntity[]> {
    return this.repository.find({
      where: { test_execution_id, evaluator_id },
    });
  }
}

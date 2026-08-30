import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestExecutionEntity } from './entities/test-execution.entity';
import { CreateTestExecutionDto } from './dto/create-test-execution.dto';
import { UpdateTestExecutionDto } from './dto/update-test-execution.dto';

@Injectable()
export class TestExecutionRepository {
  constructor(
    @InjectRepository(TestExecutionEntity)
    private readonly repository: Repository<TestExecutionEntity>
  ) {}

  async createOne(dto: CreateTestExecutionDto): Promise<TestExecutionEntity> {
    const testExecution = this.repository.create({
      test_id: dto.test_id,
      user_id: dto.user_id,
      test_score: dto.test_score ?? null,
      max_score: dto.max_score ?? null,
    });

    return this.repository.save(testExecution);
  }

  async findAll(): Promise<TestExecutionEntity[]> {
    return this.repository.find({
      order: { id: 'ASC' },
      relations: ['test', 'evaluated_user', 'evaluated_user.user', 'test_outputs'],
    });
  }

  async findById(id: number): Promise<TestExecutionEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['test', 'evaluated_user', 'evaluated_user.user', 'test_outputs'],
    });
  }

  async findByUserAndTest(
    user_id: number,
    test_id: number
  ): Promise<TestExecutionEntity | null> {
    return this.repository.findOneBy({
      user_id,
      test_id,
    });
  }

  async findByEvaluatedUserId(user_id: number): Promise<TestExecutionEntity[]> {
    return this.repository.find({
      where: { user_id },
      order: { id: 'ASC' },
      relations: ['test', 'evaluated_user', 'evaluated_user.user', 'test_outputs'],
    });
  }

  async findByTestId(test_id: number): Promise<TestExecutionEntity[]> {
    return this.repository.find({
      where: { test_id },
      order: { id: 'ASC' },
      relations: ['test', 'evaluated_user', 'evaluated_user.user', 'test_outputs'],
    });
  }

  async updateOne(
    testExecution: TestExecutionEntity,
    dto: UpdateTestExecutionDto
  ): Promise<TestExecutionEntity> {
    if (dto.test_id !== undefined) testExecution.test_id = dto.test_id;
    if (dto.user_id !== undefined) testExecution.user_id = dto.user_id;
    if (dto.test_score !== undefined)
      testExecution.test_score = dto.test_score;
    if (dto.max_score !== undefined) testExecution.max_score = dto.max_score;

    return this.repository.save(testExecution);
  }

  async deleteOne(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

export { TestExecutionRepository as ServerTestExecutionsRepository };

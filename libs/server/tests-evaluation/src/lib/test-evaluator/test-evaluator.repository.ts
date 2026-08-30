import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestEvaluatorEntity } from './entities/test-evaluator.entity';
import { CreateTestEvaluatorDto } from './dto/create-test-evaluator.dto';
import { UpdateTestEvaluatorDto } from './dto/update-test-evaluator.dto';

@Injectable()
export class TestEvaluatorRepository {
  constructor(
    @InjectRepository(TestEvaluatorEntity)
    private readonly repository: Repository<TestEvaluatorEntity>,
  ) {}

  async createOne(dto: CreateTestEvaluatorDto): Promise<TestEvaluatorEntity> {
    const evaluator = this.repository.create({ user_id: dto.user_id });
    return this.repository.save(evaluator);
  }

  async findAll(): Promise<TestEvaluatorEntity[]> {
    return this.repository.find({
      relations: ['user', 'tests'],
    });
  }

  async findByTestId(testId: number): Promise<TestEvaluatorEntity[]> {
    return this.repository.find({
      where: { tests: { id: testId } },
      relations: ['user'],
    });
  }

  async findById(id: number): Promise<TestEvaluatorEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['user', 'tests'],
    });
  }

  async findByUserId(user_id: number): Promise<TestEvaluatorEntity | null> {
    return this.repository.findOne({
      where: { user_id },
      relations: ['user', 'tests'],
    });
  }

  async updateOne(
    evaluator: TestEvaluatorEntity,
    dto: UpdateTestEvaluatorDto,
  ): Promise<TestEvaluatorEntity> {
    if (dto.user_id !== undefined) evaluator.user_id = dto.user_id;
    return this.repository.save(evaluator);
  }

  async deleteOne(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

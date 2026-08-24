import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestEvaluatorEntity } from '../entities/test-evaluator.entity';

@Injectable()
export class TestEvaluatorsRepository {
  constructor(
    @InjectRepository(TestEvaluatorEntity)
    private readonly repository: Repository<TestEvaluatorEntity>
  ) {}

  async createOne(user_id: number): Promise<TestEvaluatorEntity> {
    const testEvaluator = this.repository.create({ user_id });
    return this.repository.save(testEvaluator);
  }

  async findAll(): Promise<TestEvaluatorEntity[]> {
    return this.repository.find({
      order: { id: 'ASC' },
      relations: ['user'],
    });
  }

  async findById(id: number): Promise<TestEvaluatorEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findByUserId(user_id: number): Promise<TestEvaluatorEntity | null> {
    return this.repository.findOne({
      where: { user_id },
      relations: ['user'],
    });
  }

  async deleteOne(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async deleteByUserId(user_id: number): Promise<boolean> {
    const result = await this.repository.delete({ user_id });
    return (result.affected ?? 0) > 0;
  }
}
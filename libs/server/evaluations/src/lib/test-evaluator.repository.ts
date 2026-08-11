import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestEvaluatorEntity } from './entities/test-evaluator.entity';
import { CreateTestEvaluatorDto } from './dto/create-test-evaluator.dto';
import { UpdateTestEvaluatorDto } from './dto/update-test-evaluator.dto';

@Injectable()
export class TestEvaluatorsRepository {
    constructor(
        @InjectRepository(TestEvaluatorEntity)
        private readonly repository: Repository<TestEvaluatorEntity>) {}

    async createOne(dto: CreateTestEvaluatorDto): Promise<TestEvaluatorEntity> {
        const test_evaluator = this.repository.create({
            user_id: dto.user_id,
            tests: dto.test_ids ? dto.test_ids.map(id => ({ id })) : undefined
        });

        return this.repository.save(test_evaluator);
    }

    async findAll(): Promise<TestEvaluatorEntity[]> {
        return this.repository.find({order: {id: 'ASC'}});   
    }

    async findById(id: number): Promise<TestEvaluatorEntity | null> {
        return this.repository.findOneBy({ id });
    }

    async findByUserId(user_id: number): Promise<TestEvaluatorEntity | null> {
        return this.repository.findOneBy({ user_id });
    }

    async updateOne(id: number, dto: UpdateTestEvaluatorDto): Promise<TestEvaluatorEntity | null> {
        const test_evaluator = await this.findById(id);
        if(!test_evaluator)
            return null;
        if (dto.user_id !== undefined) test_evaluator.user_id = dto.user_id;
        if (dto.test_ids !== undefined) test_evaluator.test_ids = dto.test_ids;

        return this.repository.save(test_evaluator);
    }
    
    async deleteOne(id: number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return (result.affected ?? 0) > 0;
    }
}
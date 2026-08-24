import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestEvaluatorEntity } from '../entities/test-evaluator.entity';

@Injectable()
export class ServerTestEvaluatorsRepository {
    constructor(
        @InjectRepository(TestEvaluatorEntity)
        private readonly repository: Repository<TestEvaluatorEntity>) {}

    async createOne(dto: CreateUserDto): Promise<TestEvaluatorEntity> {
        const test_evaluator = this.repository.create({
            user_id: dto.user_id,
            tests: dto.test_ids ? dto.test_ids.map(id => ({ id })) : undefined
        });

        return this.repository.save(test_evaluator);
    }

    async findAll(): Promise<TestEvaluatorEntity[]> {
        return this.repository.find({
            order: { id: 'ASC' },
            relations: ['user', 'tests'] 
        });   
    }

    async findById(id: number): Promise<TestEvaluatorEntity | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['user', 'tests']
        });
    }

    async findByUserId(user_id: number): Promise<TestEvaluatorEntity | null> {
        return this.repository.findOneBy({ user_id });
    }

    async updateOne(test_evaluator: TestEvaluatorEntity, dto: UpdateUserDto): Promise<TestEvaluatorEntity> {
        if (dto.user_id !== undefined) test_evaluator.user_id = dto.user_id;

        // va aggiunto l'import di TestEntity
        if (dto.test_ids !== undefined) test_evaluator.tests = dto.test_ids.map(id => ({ id } as TestEntity)); 

        return this.repository.save(test_evaluator);
    }
    
    async deleteOne(id: number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return (result.affected ?? 0) > 0;
    }
}
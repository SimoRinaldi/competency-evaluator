import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { TestEvaluatorEntity } from './entities/test-evaluator.entity';
import { CreateTestEvaluatorDto } from './dto/create-test-evaluator.dto';
import { ServerTestEvaluatorsRepository } from './test-evaluator.repository';
import { UpdateTestEvaluatorDto } from './dto/update-test-evaluator.dto';

@Injectable()
export class ServerTestEvaluatorsService {
    constructor( private readonly testEvaluatorsRepository: ServerTestEvaluatorsRepository ){}

    async create(dto: CreateTestEvaluatorDto): Promise<TestEvaluatorEntity> {
        const existing = await this.testEvaluatorsRepository.findByUserId(dto.user_id);
        if (existing)
            throw new ConflictException(`L'utente con ID ${dto.user_id} è già registrato come test-evaluator.`);

        // controllare che sia un utente (controllare ruolo?)
        
        return this.testEvaluatorsRepository.createOne(dto);
    }

    async findAll(): Promise<TestEvaluatorEntity[]> {
        return this.testEvaluatorsRepository.findAll();
    }

    async findOne(id: number): Promise<TestEvaluatorEntity> {
        const test_evaluator = await this.testEvaluatorsRepository.findById(id);

        if (!test_evaluator) 
            throw new NotFoundException(`Test evaluator con ID ${id} non trovato.`);

        return test_evaluator;
    }

    async update(id: number, dto: UpdateTestEvaluatorDto) {
        return this.testEvaluatorsRepository.updateOne(id, dto);
    }

    async delete(id: number) {
        return this.testEvaluatorsRepository.deleteOne(id);
    }
}
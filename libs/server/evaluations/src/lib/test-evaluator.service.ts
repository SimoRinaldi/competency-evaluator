import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { TestEvaluatorEntity } from './entities/test-evaluator.entity';
import { CreateTestEvaluatorDto } from './dto/create-test-evaluator.dto';
import { ServerTestEvaluatorsRepository } from './test-evaluator.repository';
import { UpdateTestEvaluatorDto } from './dto/update-test-evaluator.dto';

@Injectable()
export class ServerTestEvaluatorsService {
    constructor( 
        private readonly testEvaluatorsRepository: ServerTestEvaluatorsRepository 
    ){}

    async create(dto: CreateTestEvaluatorDto): Promise<TestEvaluatorEntity> {
        const existing = await this.testEvaluatorsRepository.findByUserId(dto.user_id);
        if (existing)
            throw new ConflictException(`L'utente con ID ${dto.user_id} è già registrato come test evaluator.`);

        // Controllo esistenza utente e ruolo
        // private readonly usersService: UsersService (nel costruttore)
        /*
        const user = await this.usersService.findOne(dto.user_id);
        
        if (!user) {
            throw new NotFoundException(`Utente con ID ${dto.user_id} non trovato.`);
        }

        if (user.role !== UserRole.EVALUATOR) { // Usa la tua stringa o enum
            throw new BadRequestException('Solo gli utenti con ruolo EVALUATOR possono diventare valutatori di test.');
        }
        */
        
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
        const test_evaluator = await this.testEvaluatorsRepository.findById(id);
        if (!test_evaluator) {
            throw new NotFoundException(`Test evaluator con ID ${id} non trovato.`);
        }

        return this.testEvaluatorsRepository.updateOne(test_evaluator, dto);
    }

    async remove(id: number): Promise<void> {
        const test_evaluator = await this.testEvaluatorsRepository.findById(id);
        if (!test_evaluator) {
            throw new NotFoundException(`Test evaluator con ID ${id} non trovato.`)
        }

        const isDeleted = await this.testEvaluatorsRepository.deleteOne(id);
        if (!isDeleted) {
            throw new NotFoundException(`Errore durante l'eliminazione. Il valutatore con ID ${id} potrebbe essere già stato rimosso.`);
        }
    }
}
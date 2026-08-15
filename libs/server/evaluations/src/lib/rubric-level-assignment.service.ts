import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { RubricLevelAssignmentEntity } from './entities/rubric-level-assignment.entity';
import { CreateRubricLevelAssignmentDto } from './dto/create-rubric-level-assignment.dto';
import { ServerRubricLevelAssignmentsRepository } from './rubric-level-assignment.repository';
import { UpdateRubricLevelAssignmentDto } from './dto/update-rubric-level-assignment.dto';

@Injectable()
export class ServerRubricLevelAssignmentsService {
    constructor( 
        private readonly rubricLevelAssignmentsRepository: ServerRubricLevelAssignmentsRepository 
    ){}

    async create(dto: CreateRubricLevelAssignmentDto): Promise<RubricLevelAssignmentEntity> {
        const existing = await this.rubricLevelAssignmentsRepository.findDuplicateAssignment(
            dto.indicator_id,
            dto.test_execution_id, 
            dto.evaluator_id
        );

        if (existing) 
            throw new ConflictException(`Il valutatore ha già assegnato un livello a questo indicatore per questa esecuzione del test.`);
        
        return this.rubricLevelAssignmentsRepository.createOne(dto);
    }

    async findAll(): Promise<RubricLevelAssignmentEntity[]> {
        return this.rubricLevelAssignmentsRepository.findAll();
    }

    async findOne(id: number): Promise<RubricLevelAssignmentEntity> {
        const rla = await this.rubricLevelAssignmentsRepository.findById(id);

        if (!rla) 
            throw new NotFoundException(`Rubric Level Assignment con ID ${id} non trovato.`);

        return rla;
    }

    async update(id: number, dto: UpdateRubricLevelAssignmentDto) {
        const rla = await this.rubricLevelAssignmentsRepository.findById(id);
        if (!rla) {
            throw new NotFoundException(`Rubric Level Assignment ${id} non trovato.`);
        }

        return this.rubricLevelAssignmentsRepository.updateOne(rla, dto);
    }

    async remove(id: number): Promise<void> {
        const rla = await this.rubricLevelAssignmentsRepository.findById(id);
        if (!rla) {
            throw new NotFoundException(`Rubric Level Assignment con ID ${id} non trovato.`)
        }

        const isDeleted = await this.rubricLevelAssignmentsRepository.deleteOne(id);
        if (!isDeleted) {
            throw new NotFoundException(`Errore durante l'eliminazione. Il Rubric Level Assignment con ID ${id} potrebbe essere già stato rimosso.`);
        }
    }
}
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IndicatorsService } from '@server/competencies';
import { RubricLevelAssignmentRepository } from './rubric-level-assignment.repository';
import { CreateRubricLevelAssignmentDto } from './dto/create-rubric-level-assignment.dto';
import { UpdateRubricLevelAssignmentDto } from './dto/update-rubric-level-assignment.dto';
import { RubricLevelAssignmentEntity } from './entities/rubric-level-assignment.entity';

@Injectable()
export class RubricLevelAssignmentService {
  constructor(
    private readonly rubricLevelAssignmentsRepository: RubricLevelAssignmentRepository,
    private readonly indicatorsService: IndicatorsService
  ) {}

  async create(
    dto: CreateRubricLevelAssignmentDto
  ): Promise<RubricLevelAssignmentEntity> {
    const existing =
      await this.rubricLevelAssignmentsRepository.findDuplicateAssignment(
        dto.indicator_id,
        dto.test_execution_id,
        dto.evaluator_id
      );

    if (existing) {
      throw new ConflictException(
        `Il valutatore ha già assegnato un livello a questo indicatore per questa esecuzione del test.`
      );
    }

    await this.validateBinaryRank(dto.indicator_id, Number(dto.rubric_rank));

    return this.rubricLevelAssignmentsRepository.createOne(dto);
  }

  async findAll(): Promise<RubricLevelAssignmentEntity[]> {
    return this.rubricLevelAssignmentsRepository.findAll();
  }

  async findOne(id: number): Promise<RubricLevelAssignmentEntity> {
    const rla = await this.rubricLevelAssignmentsRepository.findById(id);

    if (!rla) {
      throw new NotFoundException(
        `Rubric Level Assignment con ID ${id} non trovato.`
      );
    }

    return rla;
  }

  async update(
    id: number,
    dto: UpdateRubricLevelAssignmentDto
  ): Promise<RubricLevelAssignmentEntity> {
    const rla = await this.rubricLevelAssignmentsRepository.findById(id);
    if (!rla) {
      throw new NotFoundException(
        `Rubric Level Assignment ${id} non trovato.`
      );
    }

    if (dto.rubric_rank !== undefined) {
      const targetIndicatorId = dto.indicator_id ?? rla.indicator_id;
      await this.validateBinaryRank(
        targetIndicatorId,
        Number(dto.rubric_rank)
      );
    }

    return this.rubricLevelAssignmentsRepository.updateOne(rla, dto);
  }

  async remove(id: number): Promise<void> {
    const rla = await this.rubricLevelAssignmentsRepository.findById(id);
    if (!rla) {
      throw new NotFoundException(
        `Rubric Level Assignment con ID ${id} non trovato.`
      );
    }

    const isDeleted =
      await this.rubricLevelAssignmentsRepository.deleteOne(id);
    if (!isDeleted) {
      throw new NotFoundException(
        `Errore durante l'eliminazione. Il Rubric Level Assignment con ID ${id} potrebbe essere già stato rimosso.`
      );
    }
  }

  async findByTestExecutionWithRelations(
    test_execution_id: number
  ): Promise<RubricLevelAssignmentEntity[]> {
    return this.rubricLevelAssignmentsRepository.findByTestExecutionWithRelations(
      test_execution_id
    );
  }

  private async validateBinaryRank(
    indicator_id: number,
    rank: number
  ): Promise<void> {
    const indicator =
      await this.indicatorsService.findByIdWithRubricSet(indicator_id);

    if (!indicator) {
      throw new NotFoundException(
        `Indicatore con ID ${indicator_id} non trovato.`
      );
    }

    const isBinary = indicator.rubric_set?.yes_no;

    if (isBinary) {
      if (rank !== 1 && rank !== 5) {
        throw new BadRequestException(
          `L'indicatore ${indicator.id} utilizza una valutazione binaria (Yes/No). I valori consentiti per il rank sono solo 1 o 5. Valore ricevuto: ${rank}`
        );
      }
    } else {
      if (rank < 1 || rank > 5) {
        throw new BadRequestException(
          `Il valore del rank deve essere compreso tra 1 e 5. Valore ricevuto: ${rank}`
        );
      }
    }
  }
}

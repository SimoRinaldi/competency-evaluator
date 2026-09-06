import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateCompetencyDto } from './dto/create-competency.dto';
import { UpdateCompetencyDto } from './dto/update-competency.dto';
import { CompetencyEntity } from './entities/competency.entity';
import { CompetencyRepository } from './competency.repository';

@Injectable()
export class CompetencyService {
  constructor(
    private readonly competencyRepository: CompetencyRepository
  ) {}

  async findOne(id: number): Promise<CompetencyEntity> {
    const competency = await this.competencyRepository.findById(id);

    if (!competency)
      throw new NotFoundException(`Competency with id ${id} not found`);

    return competency;
  }

  async findAll(): Promise<CompetencyEntity[]> {
    const competencies = await this.competencyRepository.findAll();

    return competencies || [];
  }

  async create(dto: CreateCompetencyDto): Promise<CompetencyEntity> {
    const existing = dto.title
      ? await this.competencyRepository.findByTitle(dto.title)
      : null;

    if (existing) {
      throw new ConflictException('Title already in use');
    }

    return this.competencyRepository.createOne(dto);
  }

  async update(
    id: number,
    dto: UpdateCompetencyDto
  ): Promise<CompetencyEntity> {
    // Controllo associazione test: blocca la modifica se la competenza fa parte di un test
    const isAssociated = await this.competencyRepository.isAssociatedWithAnyTest(id);
    if (isAssociated) {
      throw new ConflictException(
        'Impossibile modificare la competenza: è attualmente associata ad uno o più test.'
      );
    }

    if (dto.title) {
      const existing = await this.competencyRepository.findByTitle(
        dto.title
      );
      if (existing && existing.id !== id) {
        throw new ConflictException('Title already in use');
      }
    }

    const updated = await this.competencyRepository.updateOne(id, dto);
    if (!updated) {
      throw new NotFoundException(`Competency with id ${id} not found`);
    }

    return updated;
  }

  async remove(id: number): Promise<void> {
    // Controllo associazione test: blocca l'eliminazione se la competenza fa parte di un test
    const isAssociated = await this.competencyRepository.isAssociatedWithAnyTest(id);
    if (isAssociated) {
      throw new ConflictException(
        'Impossibile eliminare la competenza: è attualmente associata ad uno o più test.'
      );
    }

    const deleted = await this.competencyRepository.deleteOne(id);
    if (!deleted) {
      throw new NotFoundException(`Competency with id ${id} not found`);
    }
  }

  async checkAssociations(id: number): Promise<{ isAssociated: boolean }> {
    const isAssociated = await this.competencyRepository.isAssociatedWithAnyTest(id);
    return { isAssociated };
  }
}

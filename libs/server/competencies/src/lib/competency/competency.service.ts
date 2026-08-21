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

  async getOneCompetency(id: number): Promise<CompetencyEntity> {
    const competency = await this.competencyRepository.findById(id);

    if (!competency)
      throw new NotFoundException(`Competency with id ${id} not found`);

    return competency;
  }

  async getCompetencies(): Promise<CompetencyEntity[]> {
    const competencies = await this.competencyRepository.findAll();

    if (competencies && competencies.length === 0) {
      throw new NotFoundException(`No competencies found.`);
    }
    return competencies;
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

  async removeCompetency(id: number): Promise<void> {
    const deleted = await this.competencyRepository.deleteOne(id);
    if (!deleted) {
      throw new NotFoundException(`Competency with id ${id} not found`);
    }
  }
}

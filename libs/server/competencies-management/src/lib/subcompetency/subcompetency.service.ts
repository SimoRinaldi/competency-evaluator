import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateSubCompetencyDto } from './dto/create-subcompetency.dto';
import { UpdateSubCompetencyDto } from './dto/update-subcompetency.dto';
import { SubCompetencyEntity } from './entities/subcompetency.entity';
import { SubCompetencyRepository } from './subcompetency.repository';

@Injectable()
export class SubCompetencyService {
  constructor(
    private readonly subCompetencyRepository: SubCompetencyRepository
  ) {}

  async getOneSubCompetency(id: number): Promise<SubCompetencyEntity> {
    const subCompetency = await this.subCompetencyRepository.findById(id);

    if (!subCompetency)
      throw new NotFoundException(`SubCompetency with id ${id} not found`);

    return subCompetency;
  }

  async getSubCompetencies(): Promise<SubCompetencyEntity[]> {
    const subCompetencies = await this.subCompetencyRepository.findAll();

    if (subCompetencies && subCompetencies.length === 0) {
      throw new NotFoundException(`No subcompetencies found.`);
    }
    return subCompetencies;
  }

  async create(dto: CreateSubCompetencyDto): Promise<SubCompetencyEntity> {
    const existing = dto.title
      ? await this.subCompetencyRepository.findByTitle(dto.title)
      : null;

    if (existing) {
      throw new ConflictException('Title already in use');
    }

    return this.subCompetencyRepository.createOne(dto);
  }

  async update(
    id: number,
    dto: UpdateSubCompetencyDto
  ): Promise<SubCompetencyEntity> {
    if (dto.title) {
      const existing = await this.subCompetencyRepository.findByTitle(
        dto.title
      );
      if (existing && existing.id !== id) {
        throw new ConflictException('Title already in use');
      }
    }

    const updated = await this.subCompetencyRepository.updateOne(id, dto);
    if (!updated) {
      throw new NotFoundException(`SubCompetency with id ${id} not found`);
    }

    return updated;
  }

  async removeSubCompetency(id: number): Promise<void> {
    const deleted = await this.subCompetencyRepository.deleteOne(id);
    if (!deleted) {
      throw new NotFoundException(`SubCompetency with id ${id} not found`);
    }
  }
}

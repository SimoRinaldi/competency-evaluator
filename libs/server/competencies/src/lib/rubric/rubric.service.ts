import { Injectable, NotFoundException } from '@nestjs/common';
import { RubricRepository } from './rubric.repository';
import { CreateRubricSetDto } from './dto/create-rubric.dto';
import { UpdateRubricSetDto } from './dto/update-rubric.dto';
import { RubricSetEntity } from './entities/rubric-set.entity';

@Injectable()
export class RubricService {
  constructor(private readonly rubricRepository: RubricRepository) {}

  async create(createRubricSetDto: CreateRubricSetDto): Promise<RubricSetEntity> {
    return this.rubricRepository.createOne(createRubricSetDto);
  }

  async findAll(): Promise<RubricSetEntity[]> {
    return this.rubricRepository.findAll();
  }

  async findOne(id: number): Promise<RubricSetEntity> {
    const set = await this.rubricRepository.findById(id);
    if (!set) {
      throw new NotFoundException(`RubricSet con ID ${id} non trovato`);
    }
    return set;
  }

  async update(
    id: number,
    updateRubricSetDto: UpdateRubricSetDto
  ): Promise<RubricSetEntity> {
    const set = await this.rubricRepository.updateOne(id, updateRubricSetDto);
    if (!set) {
      throw new NotFoundException(`RubricSet con ID ${id} non trovato`);
    }
    return set;
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const deleted = await this.rubricRepository.deleteOne(id);
    if (!deleted) {
      throw new NotFoundException(`RubricSet con ID ${id} non trovato`);
    }
    return { deleted: true };
  }
}

export { RubricService as RubricsService };

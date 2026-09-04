import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RubricSetEntity } from './entities/rubric-set.entity';
import { RubricLevelEntity } from './entities/rubric-level.entity';
import { CreateRubricSetDto } from './dto/create-rubric.dto';
import { UpdateRubricSetDto } from './dto/update-rubric.dto';

@Injectable()
export class RubricRepository {
  constructor(
    @InjectRepository(RubricSetEntity)
    private readonly repository: Repository<RubricSetEntity>,
  ) {}

  async createOne(dto: CreateRubricSetDto): Promise<RubricSetEntity> {
    const new_rubric_set = this.repository.create({
      yes_no: dto.yes_no,
      levels: dto.levels as RubricLevelEntity[],
    });
    return this.repository.save(new_rubric_set);
  }

  async findAll(): Promise<RubricSetEntity[]> {
    return this.repository.find({
      order: { id: 'ASC' },
      relations: ['levels'],
    });
  }

  async findById(id: number): Promise<RubricSetEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['levels'],
    });
  }

  async updateOne(id: number, dto: UpdateRubricSetDto): Promise<RubricSetEntity | null> {
    const rubric_set = await this.findById(id);
    if (!rubric_set) {
      return null;
    }

    if (dto.yes_no !== undefined) {
      rubric_set.yes_no = dto.yes_no;
    }
    if (dto.levels !== undefined) {
      rubric_set.levels = dto.levels as RubricLevelEntity[];
    }

    return this.repository.save(rubric_set);
  }

  async deleteOne(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async isAssociatedWithIndicators(id: number): Promise<boolean> {
    const rubric_set = await this.repository.findOne({
      where: { id },
      relations: ['indicators'],
    });
    return (rubric_set?.indicators?.length ?? 0) > 0;
  }
}

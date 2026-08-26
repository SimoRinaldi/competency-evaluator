import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndicatorEntity } from './entities/indicator.entity';
import { CreateIndicatorDto } from './dto/create-indicator.dto';
import { UpdateIndicatorDto } from './dto/update-indicator.dto';

@Injectable()
export class IndicatorRepository {
  constructor(
    @InjectRepository(IndicatorEntity)
    private readonly repository: Repository<IndicatorEntity>
  ) {}

  async createOne(dto: CreateIndicatorDto): Promise<IndicatorEntity> {
    const indicator = this.repository.create(dto);
    return this.repository.save(indicator);
  }

  async findAll(): Promise<IndicatorEntity[]> {
    return this.repository.find({
      order: { id: 'ASC' },
      relations: ['observation_object', 'rubric_set'],
    });
  }

  async findById(id: number): Promise<IndicatorEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['observation_object', 'rubric_set'],
    });
  }

  async findByIdWithRubricSet(
    indicator_id: number
  ): Promise<IndicatorEntity | null> {
    return this.repository.findOne({
      where: { id: indicator_id },
      relations: ['rubric_set'],
    });
  }

  async updateOne(
    id: number,
    dto: UpdateIndicatorDto
  ): Promise<IndicatorEntity | null> {
    const indicator = await this.findById(id);
    if (!indicator) {
      return null;
    }
    if (dto.description !== undefined) indicator.description = dto.description;
    if (dto.weight !== undefined) indicator.weight = dto.weight;
    if (dto.rubric_set_id !== undefined)
      indicator.rubric_set_id = dto.rubric_set_id;
    if (dto.observation_object_id !== undefined)
      indicator.observation_object_id = dto.observation_object_id;

    return this.repository.save(indicator);
  }

  async deleteOne(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

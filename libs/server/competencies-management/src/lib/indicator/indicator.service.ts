import { Injectable, NotFoundException } from '@nestjs/common';
import { IndicatorRepository } from './indicator.repository';
import { CreateIndicatorDto } from './dto/create-indicator.dto';
import { UpdateIndicatorDto } from './dto/update-indicator.dto';
import { IndicatorEntity } from './entities/indicator.entity';

@Injectable()
export class IndicatorService {
  constructor(
    private readonly indicatorRepository: IndicatorRepository
  ) {}

  async create(
    createIndicatorDto: CreateIndicatorDto
  ): Promise<IndicatorEntity> {
    return this.indicatorRepository.createOne(createIndicatorDto);
  }

  async findAll(): Promise<IndicatorEntity[]> {
    return this.indicatorRepository.findAll();
  }

  async findOne(id: number): Promise<IndicatorEntity> {
    const indicator = await this.indicatorRepository.findById(id);
    if (!indicator) {
      throw new NotFoundException(`Indicator con ID ${id} non trovato`);
    }
    return indicator;
  }

  async update(
    id: number,
    updateIndicatorDto: UpdateIndicatorDto
  ): Promise<IndicatorEntity> {
    const indicator = await this.indicatorRepository.updateOne(
      id,
      updateIndicatorDto
    );
    if (!indicator) {
      throw new NotFoundException(`Indicator con ID ${id} non trovato`);
    }
    return indicator;
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const deleted = await this.indicatorRepository.deleteOne(id);
    if (!deleted) {
      throw new NotFoundException(`Indicator con ID ${id} non trovato`);
    }
    return { deleted: true };
  }

  async findByIdWithRubricSet(
    indicator_id: number
  ): Promise<IndicatorEntity | null> {
    return this.indicatorRepository.findByIdWithRubricSet(indicator_id);
  }
}

export { IndicatorService as IndicatorsService };

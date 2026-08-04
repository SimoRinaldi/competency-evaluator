import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SubCompetencyEntity } from './entities/sub-competency.entity';
import { Repository } from 'typeorm';
import { CreateSubCompetencyDto } from './dto/create-sub-competency.dto';
import { UpdateSubCompetencyDto } from './dto/update-sub-competency.dto';

@Injectable()
export class SubCompetencyRepository {
  constructor(
    @InjectRepository(SubCompetencyEntity)
    private readonly repository: Repository<SubCompetencyEntity>
  ) {}

  findById(id: number): Promise<SubCompetencyEntity | null> {
    return this.repository.findOne({ where: { id }, relations: ['competency'] });
  }

  findByTitle(title: string): Promise<SubCompetencyEntity | null> {
    return this.repository.findOne({ where: { title } });
  }

  async createOne(dto: CreateSubCompetencyDto): Promise<SubCompetencyEntity> {
    const subCompetency = this.repository.create({
      title: dto.title,
      weight: dto.weight,
      input: dto.input,
      output: dto.output,
      action: dto.action,
      competency_id: dto.competency_id,
    });
    return this.repository.save(subCompetency);
  }

  findAll(): Promise<SubCompetencyEntity[]> {
    return this.repository.find({ order: { id: 'ASC' }, relations: ['competency'] });
  }

  async updateOne(
    id: number,
    dto: UpdateSubCompetencyDto
  ): Promise<SubCompetencyEntity | null> {
    const subCompetency = await this.findById(id);
    if (!subCompetency) {
      return null;
    }
    Object.assign(subCompetency, dto);
    return this.repository.save(subCompetency);
  }

  async deleteOne(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

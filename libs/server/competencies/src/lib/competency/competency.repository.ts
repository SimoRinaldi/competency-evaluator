import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompetencyEntity } from './entities/competency.entity';
import { Repository } from 'typeorm';
import { CreateCompetencyDto } from './dto/create-competency.dto';
import { UpdateCompetencyDto } from './dto/update-competency.dto';

@Injectable()
export class CompetencyRepository {
  constructor(
    @InjectRepository(CompetencyEntity)
    private readonly repository: Repository<CompetencyEntity>
  ) {}

  findById(id: number): Promise<CompetencyEntity | null> {
    return this.repository.findOne({ where: { id }, relations: ['sub_competencies'] });
  }

  findByTitle(title: string): Promise<CompetencyEntity | null> {
    return this.repository.findOne({ where: { title } });
  }

  async createOne(dto: CreateCompetencyDto): Promise<CompetencyEntity> {
    const competency = this.repository.create({
      title: dto.title,
      weight: dto.weight,
    });
    return this.repository.save(competency);
  }

  findAll(): Promise<CompetencyEntity[]> {
    return this.repository.find({ order: { id: 'ASC' }, relations: ['sub_competencies'] });
  }

  async updateOne(
    id: number,
    dto: UpdateCompetencyDto
  ): Promise<CompetencyEntity | null> {
    const competency = await this.findById(id);
    if (!competency) {
      return null;
    }
    Object.assign(competency, dto);
    return this.repository.save(competency);
  }

  async deleteOne(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

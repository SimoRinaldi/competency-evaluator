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
    return this.repository.findOne({
      where: { id },
      relations: [
        'subcompetencies',
        'subcompetencies.observation_object',
        'subcompetencies.observation_object.indicators',
        'subcompetencies.observation_object.indicators.rubric_set',
        'subcompetencies.observation_object.indicators.rubric_set.levels',
        'subcompetencies.tools',
        'subcompetencies.methods',
        'subcompetencies.skills',
      ],
    });
  }

  findByTitle(title: string): Promise<CompetencyEntity | null> {
    return this.repository.findOne({ where: { title } });
  }

  async createOne(dto: CreateCompetencyDto): Promise<CompetencyEntity> {
    const competency = this.repository.create({
      title: dto.title,
      weight: dto.weight,
      threshold: dto.threshold
    });
    return this.repository.save(competency);
  }

  findAll(): Promise<CompetencyEntity[]> {
    return this.repository.find({ order: { id: 'ASC' }, relations: ['subcompetencies'] });
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

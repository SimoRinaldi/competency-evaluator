import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { CompetencyHistoricalScoreEntity } from './entities/competency-historical-score.entity';
import { CreateCompetencyHistoricalScoreDto } from './dto/create-competency-historical-score.dto';
import { UpdateCompetencyHistoricalScoreDto } from './dto/update-competency-historical-score.dto';

@Injectable()
export class CompetencyHistoricalScoreRepository {
  constructor(
    @InjectRepository(CompetencyHistoricalScoreEntity)
    private readonly repository: Repository<CompetencyHistoricalScoreEntity>
  ) {}

  async createOne(
    dto: CreateCompetencyHistoricalScoreDto
  ): Promise<CompetencyHistoricalScoreEntity> {
    const score = this.repository.create({
      score_absolute: dto.score_absolute,
      score_percentage: dto.score_percentage,
      user_id: dto.user_id,
      competency_id: dto.competency_id,
    });

    return this.repository.save(score);
  }

  async findAll(): Promise<CompetencyHistoricalScoreEntity[]> {
    return this.repository.find({
      order: { id: 'ASC' },
      relations: ['user', 'competency'],
    });
  }

  async findById(id: number): Promise<CompetencyHistoricalScoreEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['user', 'competency'],
    });
  }

  async findByUserAndCompetency(
    user_id: number,
    competency_id: number
  ): Promise<CompetencyHistoricalScoreEntity | null> {
    return this.repository.findOneBy({
      user_id,
      competency_id,
    });
  }

  async findAcquiredCompetencies(
    user_id: number,
  ): Promise<CompetencyHistoricalScoreEntity[]> {
    return this.repository.createQueryBuilder('comp_hist_score')
      .innerJoinAndSelect('comp_hist_score.competency', 'competency')
      .where('comp_hist_score.user_id = :id', { id: user_id })
      .andWhere('comp_hist_score.score_absolute >= competency.threshold')
      .getMany();
  }

  async updateOne(
    score: CompetencyHistoricalScoreEntity,
    dto: UpdateCompetencyHistoricalScoreDto
  ): Promise<CompetencyHistoricalScoreEntity> {
    if (dto.score_absolute !== undefined)
      score.score_absolute = dto.score_absolute;
    if (dto.score_percentage !== undefined)
      score.score_percentage = dto.score_percentage;
    if (dto.user_id !== undefined) score.user_id = dto.user_id;
    if (dto.competency_id !== undefined)
      score.competency_id = dto.competency_id;

    return this.repository.save(score);
  }

  async deleteOne(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

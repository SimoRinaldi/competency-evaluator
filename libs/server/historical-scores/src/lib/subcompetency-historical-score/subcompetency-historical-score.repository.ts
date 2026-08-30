import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubCompetencyHistoricalScoreEntity } from './entities/subcompetency-historical-score.entity';
import { CreateSubCompetencyHistoricalScoreDto } from './dto/create-subcompetency-historical-score.dto';
import { UpdateSubCompetencyHistoricalScoreDto } from './dto/update-subcompetency-historical-score.dto';

@Injectable()
export class SubCompetencyHistoricalScoreRepository {
  constructor(
    @InjectRepository(SubCompetencyHistoricalScoreEntity)
    private readonly repository: Repository<SubCompetencyHistoricalScoreEntity>
  ) {}

  async createOne(
    dto: CreateSubCompetencyHistoricalScoreDto
  ): Promise<SubCompetencyHistoricalScoreEntity> {
    const score = this.repository.create({
      score_absolute: dto.score_absolute,
      score_percentage: dto.score_percentage,
      user_id: dto.user_id,
      subcompetency_id: dto.subcompetency_id,
    });

    return this.repository.save(score);
  }

  async findAll(): Promise<SubCompetencyHistoricalScoreEntity[]> {
    return this.repository.find({
      order: { id: 'ASC' },
      relations: ['user', 'subcompetency'],
    });
  }

  async findById(
    id: number
  ): Promise<SubCompetencyHistoricalScoreEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['user', 'subcompetency'],
    });
  }

  async findByUserAndSubCompetency(
    user_id: number,
    subcompetency_id: number
  ): Promise<SubCompetencyHistoricalScoreEntity | null> {
    return this.repository.findOneBy({
      user_id,
      subcompetency_id,
    });
  }

  async findAcquiredSubCompetencies(
    user_id: number,
  ): Promise<SubCompetencyHistoricalScoreEntity[]> {
    return this.repository.createQueryBuilder('subcomp_hist_score')
      .innerJoinAndSelect('subcomp_hist_score.subcompetency', 'subcompetency')
      .where('subcomp_hist_score.user_id = :id', { id: user_id })
      .andWhere('subcomp_hist_score.score_absolute >= subcompetency.threshold')
      .getMany();
  }

  async findByUser(
    user_id: number,
  ): Promise<SubCompetencyHistoricalScoreEntity[]> {
    return this.repository.find({
      where: { user_id },
      relations: ['subcompetency'],
      order: { subcompetency_id: 'ASC' }
    });
  }

  async updateOne(
    score: SubCompetencyHistoricalScoreEntity,
    dto: UpdateSubCompetencyHistoricalScoreDto
  ): Promise<SubCompetencyHistoricalScoreEntity> {
    if (dto.score_absolute !== undefined)
      score.score_absolute = dto.score_absolute;
    if (dto.score_percentage !== undefined)
      score.score_percentage = dto.score_percentage;
    if (dto.user_id !== undefined) score.user_id = dto.user_id;
    if (dto.subcompetency_id !== undefined)
      score.subcompetency_id = dto.subcompetency_id;

    return this.repository.save(score);
  }

  async deleteOne(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

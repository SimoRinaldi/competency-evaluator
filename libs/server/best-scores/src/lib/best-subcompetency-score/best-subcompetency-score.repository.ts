import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BestSubCompetencyScoreEntity } from './entities/best-subcompetency-score.entity';
import { CreateBestSubCompetencyScoreDto } from './dto/create-best-subcompetency-score.dto';
import { UpdateBestSubCompetencyScoreDto } from './dto/update-best-subcompetency-score.dto';

@Injectable()
export class BestSubCompetencyScoreRepository {
  constructor(
    @InjectRepository(BestSubCompetencyScoreEntity)
    private readonly repository: Repository<BestSubCompetencyScoreEntity>,
  ) {}

  async createOne(dto: CreateBestSubCompetencyScoreDto): Promise<BestSubCompetencyScoreEntity> {
    const score = this.repository.create({
      best_score_absolute: dto.best_score_absolute,
      best_score_percentage: dto.best_score_percentage,
      user_id: dto.user_id,
      subcompetency_id: dto.subcompetency_id,
    });

    return this.repository.save(score);
  }

  async findAll(): Promise<BestSubCompetencyScoreEntity[]> {
    return this.repository.find({
      order: { id: 'ASC' },
      relations: ['user', 'subcompetency'],
    });
  }

  async findById(id: number): Promise<BestSubCompetencyScoreEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['user', 'subcompetency'],
    });
  }

  async findByUserAndSubCompetency(
    user_id: number,
    subcompetency_id: number,
  ): Promise<BestSubCompetencyScoreEntity | null> {
    return this.repository.findOneBy({
      user_id,
      subcompetency_id,
    });
  }

  async findAcquiredSubCompetencies(user_id: number): Promise<BestSubCompetencyScoreEntity[]> {
    return this.repository
      .createQueryBuilder('subcomp_hist_score')
      .innerJoinAndSelect('subcomp_hist_score.subcompetency', 'subcompetency')
      .where('subcomp_hist_score.user_id = :id', { id: user_id })
      .andWhere('subcomp_hist_score.best_score_absolute >= subcompetency.threshold')
      .getMany();
  }

  async findByUser(user_id: number): Promise<BestSubCompetencyScoreEntity[]> {
    return this.repository.find({
      where: { user_id },
      relations: ['subcompetency'],
      order: { subcompetency_id: 'ASC' },
    });
  }

  async updateOne(
    score: BestSubCompetencyScoreEntity,
    dto: UpdateBestSubCompetencyScoreDto,
  ): Promise<BestSubCompetencyScoreEntity> {
    if (dto.best_score_absolute !== undefined) score.best_score_absolute = dto.best_score_absolute;
    if (dto.best_score_percentage !== undefined)
      score.best_score_percentage = dto.best_score_percentage;
    if (dto.user_id !== undefined) score.user_id = dto.user_id;
    if (dto.subcompetency_id !== undefined) score.subcompetency_id = dto.subcompetency_id;

    return this.repository.save(score);
  }

  async deleteOne(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

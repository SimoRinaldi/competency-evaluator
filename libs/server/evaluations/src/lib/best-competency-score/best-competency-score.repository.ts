import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BestCompetencyScoreEntity } from './entities/best-competency-score.entity';
import { CreateBestCompetencyScoreDto } from './dto/create-best-competency-score.dto';
import { UpdateBestCompetencyScoreDto } from './dto/update-best-competency-score.dto';

@Injectable()
export class BestCompetencyScoreRepository {
  constructor(
    @InjectRepository(BestCompetencyScoreEntity)
    private readonly repository: Repository<BestCompetencyScoreEntity>
  ) {}

  async createOne(dto: CreateBestCompetencyScoreDto): Promise<BestCompetencyScoreEntity> {
    const bcs = this.repository.create({
      best_score_absolute: dto.best_score_absolute,
      best_score_percentage: dto.best_score_percentage,
      user_id: dto.user_id,
      competency_id: dto.competency_id,
    });

    return this.repository.save(bcs);
  }

  async findAll(): Promise<BestCompetencyScoreEntity[]> {
    return this.repository.find({
      order: { id: 'ASC' },
      relations: ['user', 'competency'],
    });
  }

  async findById(id: number): Promise<BestCompetencyScoreEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['user', 'competency'],
    });
  }

  async findByUserAndCompetency(
    user_id: number,
    competency_id: number
  ): Promise<BestCompetencyScoreEntity | null> {
    return this.repository.findOneBy({
      user_id,
      competency_id,
    });
  }

  async updateOne(
    bcs: BestCompetencyScoreEntity,
    dto: UpdateBestCompetencyScoreDto
  ): Promise<BestCompetencyScoreEntity> {
    if (dto.best_score_absolute !== undefined)
      bcs.best_score_absolute = dto.best_score_absolute;
    if (dto.best_score_percentage !== undefined)
      bcs.best_score_percentage = dto.best_score_percentage;
    if (dto.user_id !== undefined) bcs.user_id = dto.user_id;
    if (dto.competency_id !== undefined)
      bcs.competency_id = dto.competency_id;

    return this.repository.save(bcs);
  }

  async deleteOne(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

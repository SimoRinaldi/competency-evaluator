import { Injectable } from '@nestjs/common';
import { CompetencyHistoricalScoreService } from './competency-historical-score/competency-historical-score.service';
import { SubCompetencyHistoricalScoreService } from './subcompetency-historical-score/subcompetency-historical-score.service';
import { SubCompetencyHistoricalScoreEntity } from './subcompetency-historical-score/entities/subcompetency-historical-score.entity';

@Injectable()
export class HistoricalScoresService {
  constructor(
    private readonly competencyScoreService: CompetencyHistoricalScoreService,
    private readonly subCompetencyScoreService: SubCompetencyHistoricalScoreService,
  ) {}

  async upsertSubCompetencyScores(
    subcompetency_id: number,
    obtained_score: number,
    percentage: number,
    user_id: number
  ): Promise<void> {
    const existing = await this.subCompetencyScoreService.findByUserAndSubCompetency(user_id, subcompetency_id);
    if (existing) {
      await this.subCompetencyScoreService.update(existing.id, {
        score_absolute: obtained_score,
        score_percentage: percentage.toFixed(2),
      });
    } else {
      await this.subCompetencyScoreService.create({
        score_absolute: obtained_score,
        score_percentage: percentage.toFixed(2),
        user_id: user_id,
        subcompetency_id: subcompetency_id,
      });
    }
  }

  async getSubCompetencyScore(
    subcompetency_id: number,
    user_id: number
  ): Promise<SubCompetencyHistoricalScoreEntity | null> {
    return this.subCompetencyScoreService.findByUserAndSubCompetency(user_id, subcompetency_id);
  }

  async upsertCompetencyScores(
    competency_id: number,
    user_id: number,
    obtained_score: number,
    percentage: number
  ): Promise<void> {
    const existing = await this.competencyScoreService.findByUserAndCompetency(user_id, competency_id);
    if (existing) {
      await this.competencyScoreService.update(existing.id, {
        score_absolute: Math.round(obtained_score),
        score_percentage: percentage.toFixed(2),
      });
    } else {
      await this.competencyScoreService.create({
        score_absolute: Math.round(obtained_score),
        score_percentage: percentage.toFixed(2),
        user_id: user_id,
        competency_id: competency_id,
      });
    }
  }
}

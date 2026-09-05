import { Injectable } from '@nestjs/common';
import { BestCompetencyScoreService } from './best-competency-score/best-competency-score.service';
import { BestSubCompetencyScoreService } from './best-subcompetency-score/best-subcompetency-score.service';
import { BestSubCompetencyScoreEntity } from './best-subcompetency-score/entities/best-subcompetency-score.entity';

@Injectable()
export class BestScoresService {
  constructor(
    private readonly competencyScoreService: BestCompetencyScoreService,
    private readonly subCompetencyScoreService: BestSubCompetencyScoreService,
  ) {}

  // aggiorna/inserisce il best score (assoluto e percentuale)
  // relativo alla coppia (sottocompetenza-utente_valutato)
  async upsertSubCompetencyScores(
    subcompetency_id: number,
    obtained_score: number,
    percentage: number,
    evaluated_user_id: number,
  ): Promise<void> {
    const existing = await this.subCompetencyScoreService.findByUserAndSubCompetency(
      evaluated_user_id,
      subcompetency_id,
    );
    if (existing) {
      if (obtained_score > existing.best_score_absolute)
        // aggiorna sole se il nuovo punteggio è più alto, altrimenti non fa nulla
        await this.subCompetencyScoreService.update(existing.id, {
          best_score_absolute: obtained_score,
          best_score_percentage: percentage.toFixed(2),
        });
      // se non esiste il record lo crea
    } else {
      await this.subCompetencyScoreService.create({
        best_score_absolute: obtained_score,
        best_score_percentage: percentage.toFixed(2),
        user_id: evaluated_user_id,
        subcompetency_id: subcompetency_id,
      });
    }
  }

  // aggiorna/inserisce il best score (assoluto e percentuale)
  // relativo alla coppia (competenza-utente_valutato)
  async upsertCompetencyScores(
    competency_id: number,
    obtained_score: number,
    percentage: number,
    evaluated_user_id: number,
  ): Promise<void> {
    const existing = await this.competencyScoreService.findByUserAndCompetency(
      evaluated_user_id,
      competency_id,
    );
    if (existing) {
      if (obtained_score > existing.best_score_absolute)
        // aggiorna sole se il nuovo punteggio è più alto, altrimenti non fa nulla
        await this.competencyScoreService.update(existing.id, {
          best_score_absolute: Math.round(obtained_score),
          best_score_percentage: percentage.toFixed(2),
        });
      // se non esiste il record lo crea
    } else {
      await this.competencyScoreService.create({
        best_score_absolute: Math.round(obtained_score),
        best_score_percentage: percentage.toFixed(2),
        user_id: evaluated_user_id,
        competency_id: competency_id,
      });
    }
  }

  async getSubCompetencyScore(
    subcompetency_id: number,
    user_id: number,
  ): Promise<BestSubCompetencyScoreEntity | null> {
    return this.subCompetencyScoreService.findByUserAndSubCompetency(user_id, subcompetency_id);
  }
}

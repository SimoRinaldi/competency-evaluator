import { Injectable } from '@nestjs/common';
import { BestCompetencyScoreService } from './best-competency-score/best-competency-score.service';
import { BestSubCompetencyScoreService } from './best-subcompetency-score/best-subcompetency-score.service';
import { BestSubCompetencyScoreEntity } from './best-subcompetency-score/entities/best-subcompetency-score.entity';
import {
  CompetencyEntity,
  CompetencyService,
} from '@server/competencies-management';
import { BestScoresDto } from './dto/best-scores.dto';
import { BestCompetencyScoreEntity } from './best-competency-score/entities/best-competency-score.entity';
import { UserCompetencyEvaluationDto } from './best-competency-score/dto/user-competency-evaluation.dto';
import { UserSubCompetencyEvaluationDto } from './best-subcompetency-score/dto/user-subcompetency-evaluation.dto';
@Injectable()
export class BestScoresService {
  constructor(
    private readonly competencyScoreService: BestCompetencyScoreService,
    private readonly subCompetencyScoreService: BestSubCompetencyScoreService,
    private readonly competencyService: CompetencyService,
  ) {}

  async getBestScores(user_id: number): Promise<BestScoresDto> {
    const allCompetencies: CompetencyEntity[] = await this.competencyService.findAll();
    const allCompetenciesScores: BestCompetencyScoreEntity[] =
      await this.competencyScoreService.findByUser(user_id);
    const allSubcompetenciesScores: BestSubCompetencyScoreEntity[] =
      await this.subCompetencyScoreService.findByUser(user_id);

    const user_competencies_scores = new Map<number, BestCompetencyScoreEntity>(
      allCompetenciesScores.map((comp) => [comp.competency_id, comp])
    );
    const user_subcompetencies_scores = new Map<number, BestSubCompetencyScoreEntity>(
      allSubcompetenciesScores.map((subcomp) => [subcomp.subcompetency_id, subcomp])
    );

    const user_scores: BestScoresDto = {
      acquired_competencies: [],
      unacquired_competencies: [],
    };

    for (const competency of allCompetencies) {
      const comp_score = user_competencies_scores.get(competency.id);
      const best_score_competencies: UserCompetencyEvaluationDto = {
        competency_id: competency.id,
        title: competency.title,
        threshold: competency.threshold,
        score_absolute: comp_score ? comp_score.best_score_absolute : null,
        score_percentage: comp_score ? comp_score.best_score_percentage : null,
        subcompetencies: [],
      };

      let all_subcomp_are_acquired = true;
      for (const subcompetency of competency.subcompetencies ?? []) {
        const subcomp_score = user_subcompetencies_scores.get(
          subcompetency.id,
        );

        const isSubcompAcquired =
          subcomp_score !== undefined &&
          subcomp_score.best_score_absolute >= subcompetency.threshold;
        all_subcomp_are_acquired = all_subcomp_are_acquired && isSubcompAcquired;

        const best_score_subcompetencies: UserSubCompetencyEvaluationDto = {
          competency_id: competency.id,
          subcompetency_id: subcompetency.id,
          threshold: subcompetency.threshold,
          title: subcompetency.title,
          score_absolute: subcomp_score ? subcomp_score.best_score_absolute : null,
          score_percentage: subcomp_score ? subcomp_score.best_score_percentage : null,
          acquired: isSubcompAcquired,
        };

        best_score_competencies.subcompetencies.push(best_score_subcompetencies);
      }

      const isCompAcquired =
        comp_score !== undefined &&
        comp_score.best_score_absolute >= competency.threshold;

      if (all_subcomp_are_acquired && isCompAcquired) {
        user_scores.acquired_competencies.push(best_score_competencies);
      } else {
        user_scores.unacquired_competencies.push(best_score_competencies);
      }
    }

    return user_scores;
  }

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

import { Injectable, NotFoundException } from '@nestjs/common';
import { CompetencyHistoricalScoreService } from './competency-historical-score/competency-historical-score.service';
import { SubCompetencyHistoricalScoreService } from './subcompetency-historical-score/subcompetency-historical-score.service';
import { SubCompetencyHistoricalScoreEntity } from './subcompetency-historical-score/entities/subcompetency-historical-score.entity';
import { CompetencyService } from '@server/competencies-management';
import { UserCompetencyEvaluationDto } from './competency-historical-score/dto/user-competency-evaluation.dto';
import { UserSubCompetencyEvaluationDto } from './subcompetency-historical-score/dto/user-subcompetency-evaluation.dto';

@Injectable()
export class HistoricalScoresService {
  constructor(
    private readonly competencyScoreService: CompetencyHistoricalScoreService,
    private readonly subCompetencyScoreService: SubCompetencyHistoricalScoreService,
    private readonly competencyService: CompetencyService,
  ) {}

  async findAcquiredCompetencies(
    user_id: number
  ): Promise<UserCompetencyEvaluationDto[]> {
    const userScores = await this.competencyScoreService.findByUser(user_id);
    const acquired: UserCompetencyEvaluationDto[] = userScores
      .filter(
        (score) =>
          score.competency && score.score_absolute >= score.competency.threshold
      )
      .map((score) => ({
        competency_id: score.competency_id,
        title: score.competency!.title,
        threshold: score.competency!.threshold,
        score_absolute: score.score_absolute,
        score_percentage: score.score_percentage,
      }));

    if (acquired.length === 0) {
      throw new NotFoundException(
        `Nessuna competenza acquisita trovata per l'utente ${user_id}`
      );
    }

    return acquired;
  }

  async findUnacquiredCompetencies(
    user_id: number
  ): Promise<UserCompetencyEvaluationDto[]> {
    const [allCompetencies, userScores] = await Promise.all([
      this.competencyService.findAll(),
      this.competencyScoreService.findByUser(user_id),
    ]);

    const userScoresMap = new Map(
      userScores.map((score) => [score.competency_id, score])
    );

    const unacquired: UserCompetencyEvaluationDto[] = [];

    for (const competency of allCompetencies) {
      const userScore = userScoresMap.get(competency.id);

      if (!userScore) {
        unacquired.push({
          competency_id: competency.id,
          title: competency.title,
          threshold: competency.threshold,
          score_absolute: null,
          score_percentage: null,
        });

        // TODO: ragionare sul funzionamento soglia
        // - se tutte le sottocompetenze sono superate => competenza superata (?)
        // - mettere score_absolute quando esiste una sottocompetenza la cui valutazione non supera la soglia (?)
      } else if (userScore.score_absolute < competency.threshold) {
        unacquired.push({
          competency_id: competency.id,
          title: competency.title,
          threshold: competency.threshold,
          score_absolute: userScore.score_absolute,
          score_percentage: userScore.score_percentage,
        });
      }
    }

    if (unacquired.length === 0) {
      throw new NotFoundException(
        `Nessuna competenza NON acquisita trovata per l'utente ${user_id}`
      );
    }

    return unacquired;
  }

  async findAcquiredSubCompetencies(
    user_id: number,
    competency_id: number
  ): Promise<UserSubCompetencyEvaluationDto[]> {
    const [competency, userScores] = await Promise.all([
      this.competencyService.findOne(competency_id),
      this.subCompetencyScoreService.findByUser(user_id),
    ]);

    const userScoresMap = new Map(
      userScores.map((score) => [score.subcompetency_id, score])
    );

    const subcompetencies = competency.subcompetencies ?? [];
    const acquired: UserSubCompetencyEvaluationDto[] = [];

    for (const subcomp of subcompetencies) {
      const userScore = userScoresMap.get(subcomp.id);
      if (userScore && userScore.score_absolute >= subcomp.threshold) {
        acquired.push({
          subcompetency_id: subcomp.id,
          title: subcomp.title,
          competency_id: subcomp.competency_id,
          threshold: subcomp.threshold,
          score_absolute: userScore.score_absolute,
          score_percentage: userScore.score_percentage,
        });
      }
    }

    if (acquired.length === 0) {
      throw new NotFoundException(
        `Nessuna sotto-competenza acquisita trovata per l'utente ${user_id} nella competenza ${competency_id}`
      );
    }

    return acquired;
  }

  async findUnacquiredSubCompetencies(
    user_id: number,
    competency_id: number
  ): Promise<UserSubCompetencyEvaluationDto[]> {
    const [competency, userScores] = await Promise.all([
      this.competencyService.findOne(competency_id),
      this.subCompetencyScoreService.findByUser(user_id),
    ]);

    const userScoresMap = new Map(
      userScores.map((score) => [score.subcompetency_id, score])
    );

    const subcompetencies = competency.subcompetencies ?? [];
    const unacquired: UserSubCompetencyEvaluationDto[] = [];

    for (const subcomp of subcompetencies) {
      const userScore = userScoresMap.get(subcomp.id);

      if (!userScore) {
        unacquired.push({
          subcompetency_id: subcomp.id,
          title: subcomp.title,
          competency_id: subcomp.competency_id,
          threshold: subcomp.threshold,
          score_absolute: null,
          score_percentage: null,
        });
      } else if (userScore.score_absolute < subcomp.threshold) {
        unacquired.push({
          subcompetency_id: subcomp.id,
          title: subcomp.title,
          competency_id: subcomp.competency_id,
          threshold: subcomp.threshold,
          score_absolute: userScore.score_absolute,
          score_percentage: userScore.score_percentage,
        });
      }
    }

    if (unacquired.length === 0) {
      throw new NotFoundException(
        `Nessuna sotto-competenza NON acquisita trovata per l'utente ${user_id} nella competenza ${competency_id}`
      );
    }

    return unacquired;
  }

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

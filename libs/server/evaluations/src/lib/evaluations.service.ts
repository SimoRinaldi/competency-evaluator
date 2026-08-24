import { Injectable } from '@nestjs/common';
import { RubricLevelAssignmentService } from './rubric-level-assignment/rubric-level-assignment.service';
import { BestSubCompetencyScoreService } from './best-subcompetency-score/best-subcompetency-score.service';
import { BestCompetencyScoreService } from './best-competency-score/best-competency-score.service';

@Injectable()
export class ServerEvaluationsService {
  constructor(
    private readonly rubricLevelAssignmentsService: RubricLevelAssignmentService,
    private readonly bestSubCompetencyScoresService: BestSubCompetencyScoreService,
    private readonly bestCompetencyScoresService: BestCompetencyScoreService
  ) {}

  async calculateTestScores(
    test_execution_id: number,
    user_id: number
  ): Promise<void> {
    const rubricLevelAssignments =
      await this.rubricLevelAssignmentsService.findByTestExecutionWithRelations(
        test_execution_id
      );

    if (!rubricLevelAssignments || rubricLevelAssignments.length === 0) {
      return;
    }

    // Chiave: indicator_id | Valore: { sum_rank, count, data }
    const groupedIndicators = new Map<
      number,
      {
        sum_rank: number;
        count: number;
        data: (typeof rubricLevelAssignments)[0];
      }
    >();

    for (const rla of rubricLevelAssignments) {
      const ind_id = rla.indicator?.id ?? rla.indicator_id;

      const current = groupedIndicators.get(ind_id) ?? {
        sum_rank: 0,
        count: 0,
        data: rla,
      };

      current.sum_rank += Number(rla.rubric_rank);
      current.count += 1;
      groupedIndicators.set(ind_id, current);
    }

    // Chiave: subcompetency_id | Valore: { obtained, max, competency_id }
    const subCompetencyScores = new Map<
      number,
      { obtained: number; max: number; competency_id?: number }
    >();

    for (const grouped of groupedIndicators.values()) {
      const average_RL = grouped.sum_rank / grouped.count;

      const rla = grouped.data;
      const P_ind = rla.indicator?.weight ?? 1;
      const observationObject = rla.indicator?.observation_object;
      const subcomp = observationObject?.subcompetency;
      if (!subcomp) continue;

      const P_sub = subcomp.weight ?? 1;
      const P_comp = subcomp.competency?.weight ?? 1;

      const weight_sum = Number(P_comp) + Number(P_sub) + Number(P_ind);

      const partial_obtained = weight_sum * average_RL;
      const partial_max = weight_sum * 5;

      const currentSubcomp = subCompetencyScores.get(subcomp.id) ?? {
        obtained: 0,
        max: 0,
        competency_id: subcomp.competency?.id,
      };

      currentSubcomp.obtained += partial_obtained;
      currentSubcomp.max += partial_max;
      subCompetencyScores.set(subcomp.id, currentSubcomp);
    }

    // Chiave: competency_id | Valore: { obtained, max }
    const competencyScores = new Map<
      number,
      { obtained: number; max: number }
    >();

    for (const [subcomp_id, stats] of subCompetencyScores.entries()) {
      const subcomp_percentage =
        stats.max > 0 ? (stats.obtained / stats.max) * 100 : 0;

      await this.upsertBestSubCompetencyScores(
        user_id,
        subcomp_id,
        stats.obtained,
        subcomp_percentage
      );

      if (stats.competency_id !== undefined) {
        const currentComp = competencyScores.get(stats.competency_id) ?? {
          obtained: 0,
          max: 0,
        };
        currentComp.obtained += stats.obtained;
        currentComp.max += stats.max;
        competencyScores.set(stats.competency_id, currentComp);
      }
    }

    for (const [comp_id, stats] of competencyScores.entries()) {
      const comp_percentage =
        stats.max > 0 ? (stats.obtained / stats.max) * 100 : 0;

      await this.upsertBestCompetencyScores(
        user_id,
        comp_id,
        stats.obtained,
        comp_percentage
      );
    }
  }

  private async upsertBestSubCompetencyScores(
    user_id: number,
    subcompetency_id: number,
    obtained: number,
    percentage: number
  ): Promise<void> {
    const existing =
      await this.bestSubCompetencyScoresService.findByUserAndSubCompetency(
        user_id,
        subcompetency_id
      );
    const percentage_str = percentage.toFixed(2);

    if (!existing) {
      await this.bestSubCompetencyScoresService.create({
        best_score_absolute: Math.round(obtained),
        best_score_percentage: percentage_str,
        user_id: user_id,
        subcompetency_id: subcompetency_id,
      });
    } else if (percentage > Number(existing.best_score_percentage)) {
      await this.bestSubCompetencyScoresService.update(existing.id, {
        best_score_absolute: Math.round(obtained),
        best_score_percentage: percentage_str,
      });
    }
  }

  private async upsertBestCompetencyScores(
    user_id: number,
    competency_id: number,
    obtained: number,
    percentage: number
  ): Promise<void> {
    const existing =
      await this.bestCompetencyScoresService.findByUserAndCompetency(
        user_id,
        competency_id
      );
    const percentage_str = percentage.toFixed(2);

    if (!existing) {
      await this.bestCompetencyScoresService.create({
        best_score_absolute: Math.round(obtained),
        best_score_percentage: percentage_str,
        user_id: user_id,
        competency_id: competency_id,
      });
    } else if (percentage > Number(existing.best_score_percentage)) {
      await this.bestCompetencyScoresService.update(existing.id, {
        best_score_absolute: Math.round(obtained),
        best_score_percentage: percentage_str,
      });
    }
  }
}

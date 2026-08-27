import { Injectable } from '@nestjs/common';
import { RubricLevelAssignmentService } from './rubric-level-assignment/rubric-level-assignment.service';
import {
  CompetencyHistoricalScoreService,
  SubCompetencyHistoricalScoreService,
} from '@server/historical-scores';
import { TestExecutionService } from '@server/tests-execution';

@Injectable()
export class TestsEvaluationService {
  constructor(
    private readonly rubricLevelAssignmentsService: RubricLevelAssignmentService,
    private readonly subCompetencyHistoricalScoreService: SubCompetencyHistoricalScoreService,
    private readonly competencyHistoricalScoreService: CompetencyHistoricalScoreService,
    private readonly testExecutionService: TestExecutionService
  ) {}

  async calculateTestScores(
    test_execution_id: number,
    user_id: number
  ): Promise<void> {
    // estrae tutti i rubricLevelAssignments relativi ad una test_execution
    const rubricLevelAssignments =
      await this.rubricLevelAssignmentsService.findByTestExecutionWithRelations(
        test_execution_id
      );

    if (!rubricLevelAssignments || rubricLevelAssignments.length === 0) {
      return;
    }

    // Mappa per aggregare i voti di TUTTI i valutatori per ogni singolo indicatore.
    const groupedIndicators = new Map<
      number,
      {
        sum_rank: number;
        count: number;
        data: (typeof rubricLevelAssignments)[0];
      }
    >();

    // scorre TUTTI i voti (rubricLevelAssignments) inseriti per questa esecuzione del test
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

    // Mappa per accumulare i punteggi totali (ottenuto e massimo) per ogni sotto-competenza.
    const subCompetencyScores = new Map<
      number,
      { obtained: number; max: number; competency_id?: number }
    >();

    for (const indicator_stats of groupedIndicators.values()) {
      const average_RL = indicator_stats.sum_rank / indicator_stats.count;

      const rla = indicator_stats.data;
      const P_ind = rla.indicator?.weight;
      const observationObject = rla.indicator?.observation_object;
      const subcomp = observationObject?.subcompetency;
      if (!subcomp) continue;

      const P_sub = subcomp.weight;
      const P_comp = subcomp.competency?.weight;

      const weight_sum = Number(P_comp) + Number(P_sub) + Number(P_ind);

      const partial_obtained = weight_sum * average_RL;
      const partial_max = weight_sum * 5;

      const currentSubComp = subCompetencyScores.get(subcomp.id) ?? {
        obtained: 0,
        max: 0,
        competency_id: subcomp.competency?.id,
      };

      currentSubComp.obtained += partial_obtained;
      currentSubComp.max += partial_max;
      subCompetencyScores.set(subcomp.id, currentSubComp);
    }

    // Mappa per accumulare i punteggi totali (ottenuto e massimo) per la singola competenza padre.
    const competencyScores = new Map<
      number,
      { obtained: number; max: number }
    >();

    for (const [subcomp_id, subcompStats] of subCompetencyScores.entries()) {
      const subcomp_percentage =
        subcompStats.max > 0
          ? (subcompStats.obtained / subcompStats.max) * 100
          : 0;

      await this.subCompetencyHistoricalScoreService.create({
        score_absolute: Math.round(subcompStats.obtained),
        score_percentage: subcomp_percentage.toFixed(2),
        user_id: user_id,
        subcompetency_id: subcomp_id,
      });

      if (subcompStats.competency_id !== undefined) {
        const currentComp = competencyScores.get(
          subcompStats.competency_id
        ) ?? {
          obtained: 0,
          max: 0,
        };

        currentComp.obtained += subcompStats.obtained;
        currentComp.max += subcompStats.max;
        competencyScores.set(subcompStats.competency_id, currentComp);
      }
    }

    for (const [comp_id, compStats] of competencyScores.entries()) {
      const comp_percentage =
        compStats.max > 0 ? (compStats.obtained / compStats.max) * 100 : 0;

      await this.competencyHistoricalScoreService.create({
        score_absolute: Math.round(compStats.obtained),
        score_percentage: comp_percentage.toFixed(2),
        user_id: user_id,
        competency_id: comp_id,
      });
    }

    // Aggiornamento punteggio globale del test
    let test_score = 0;
    let max_score = 0;

    for (const stats of subCompetencyScores.values()) {
      test_score += stats.obtained;
      max_score += stats.max;
    }

    await this.testExecutionService.update(test_execution_id, {
      test_score: test_score.toFixed(2),
      max_score: max_score.toFixed(2),
    });
  }
}

export {
  TestsEvaluationService as ServerTestsEvaluationService,
  TestsEvaluationService as ServerEvaluationsService,
};

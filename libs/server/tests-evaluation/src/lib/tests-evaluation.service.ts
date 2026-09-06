import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RubricLevelAssignmentService } from './rubric-level-assignment/rubric-level-assignment.service';
import { RubricLevelAssignmentEntity } from './rubric-level-assignment/entities/rubric-level-assignment.entity';
import { BestScoresService } from '@server/best_scores';
import { TestExecutionService } from '@server/tests-execution';
import { CompetencyService } from '@server/competencies-management';
import { IndicatorsService } from '@server/competencies-management';
import { SubmitEvaluationDto } from './dto/submit-evaluation.dto';
import { TestEvaluatorService } from './test-evaluator/test-evaluator.service';

@Injectable()
export class TestsEvaluationService {
  constructor(
    private readonly rubricLevelAssignmentsService: RubricLevelAssignmentService,
    private readonly bestScoresService: BestScoresService,
    private readonly testExecutionService: TestExecutionService,
    private readonly competencyService: CompetencyService,
    private readonly indicatorsService: IndicatorsService,
    private readonly testEvaluatorService: TestEvaluatorService,
    private readonly dataSource: DataSource,
  ) {}

  async submitEvaluation(dto: SubmitEvaluationDto, current_user_id?: number) {
    if (!dto.evaluations || dto.evaluations.length === 0) {
      throw new BadRequestException(
        'La richiesta deve contenere almeno una valutazione ad un indicatore.',
      );
    }

    // recupera il valutatore
    let evaluator = null;
    if (dto.evaluator_id) {
      evaluator = await this.testEvaluatorService.findOne(dto.evaluator_id);
    } else if (current_user_id) {
      evaluator = await this.testEvaluatorService.findByUserId(current_user_id);
    }

    // verifica se esiste il valutatore
    if (!evaluator) {
      throw new NotFoundException('Valutatore non trovato o non specificato.');
    }

    // verifica se esiste la test_execution
    const test_execution = await this.testExecutionService.findOne(dto.test_execution_id);
    if (!test_execution) {
      throw new NotFoundException(`Test Execution con ID ${dto.test_execution_id} non trovata.`);
    }

    // verifica che il test esista e ricava le sue sotto-competenze ammesse
    if (!test_execution.test || !test_execution.test.subcompetencies) {
      throw new BadRequestException(
        'Impossibile recuperare le sotto-competenze associate al test da valutare.',
      );
    }

    const allowed_subcompetency_ids = new Set(test_execution.test.subcompetencies.map((s) => s.id));

    // verifica la validità di ogni rubric rank e l'appartenenza dell'indicatore al test
    for (const evaluation of dto.evaluations) {
      // validazione del rank
      await this.rubricLevelAssignmentsService.validateRubricRank(
        evaluation.indicator_id,
        Number(evaluation.rubric_rank),
      );

      // validazione indicatore, controllo appartenenza alle sotto-competenze del test
      const indicator = await this.indicatorsService.findOne(evaluation.indicator_id);
      const subcomp_id = indicator.observation_object?.subcompetency_id;

      if (!subcomp_id || !allowed_subcompetency_ids.has(subcomp_id)) {
        throw new BadRequestException(
          `L'indicatore con ID ${evaluation.indicator_id} non appartiene a nessuna delle sotto-competenze previste per questo test.`,
        );
      }
    }

    const query_runner = this.dataSource.createQueryRunner();
    await query_runner.connect();
    await query_runner.startTransaction();

    try {
      const manager = query_runner.manager;

      for (const evaluation of dto.evaluations) {
        const existing = await manager.findOne(RubricLevelAssignmentEntity, {
          where: {
            indicator_id: evaluation.indicator_id,
            test_execution_id: dto.test_execution_id,
            evaluator_id: evaluator.id,
          },
        });

        if (existing) {
          existing.rubric_rank = evaluation.rubric_rank;
          await manager.save(existing);
        } else {
          const new_rla = manager.create(RubricLevelAssignmentEntity, {
            indicator_id: evaluation.indicator_id,
            test_execution_id: dto.test_execution_id,
            evaluator_id: evaluator.id,
            rubric_rank: evaluation.rubric_rank,
          });
          await manager.save(new_rla);
        }
      }

      await query_runner.commitTransaction();
    } catch (error) {
      await query_runner.rollbackTransaction();
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Errore durante il salvataggio delle valutazioni: ${
          (error as Error).message || 'Operazione annullata.'
        }`,
      );
    } finally {
      await query_runner.release();
    }

    const all_evaluated = await this.allTestEvaluatorsHaveEvaluatedTest(
      dto.test_execution_id,
      test_execution.test.id,
    );

    // ricalcolo dei punteggi solo se tutti i valutatori hanno espresso le loro valutazioni
    if (all_evaluated) {
      const real_user_id = test_execution.evaluated_user?.user_id ?? test_execution.user_id;
      await this.calculateTestScores(dto.test_execution_id, real_user_id);
    }

    return {
      message:
        'Valutazione salvata' + (all_evaluated ? ' e punteggi ricalcolati' : '') + ' con successo.',
      test_execution_id: dto.test_execution_id,
      evaluator_id: evaluator.id,
    };
  }

  async calculateTestScores(test_execution_id: number, evaluated_user_id: number): Promise<void> {
    // estrae tutti i rubricLevelAssignments relativi ad una test_execution
    const rlas = await this.rubricLevelAssignmentsService.findByTestExecutionWithRelations(
      test_execution_id,
    );

    if (!rlas || rlas.length === 0) return;

    // aggrega i voti dei valutatori per ogni singolo indicatore
    const grouped_indicators = this.aggregateIndicatorRanks(rlas);

    // calcola i punteggi (ottenuto e massimo) per ogni sotto-competenza associata al test
    const subcompetency_scores = this.calculateSubCompetencyTestScores(grouped_indicators);

    // inserisce o aggiorna i record delle sotto-competenze associate a questo test
    await this.upsertSubCompetenciesScores(subcompetency_scores, evaluated_user_id);

    // identifica le competenze associate al test
    const test_competencies = await this.identifyTestCompetencies(subcompetency_scores);

    // ricalcola il punteggio storico per ogni competenza associata al test
    await this.recalculateBestCompetencyScores(test_competencies, evaluated_user_id);

    // aggiorna il punteggio del test
    await this.updateTestExecutionScore(test_execution_id, subcompetency_scores);
  }

  async allTestEvaluatorsHaveEvaluatedTest(
    test_execution_id: number,
    test_id: number,
  ): Promise<boolean> {
    const rlas = await this.rubricLevelAssignmentsService.findByTestExecutionWithRelations(
      test_execution_id,
    );

    // recupera i valutatori assegnati a questo test
    const assigned_evaluators = await this.testEvaluatorService.findByTestId(test_id);
    // estrae gli id univoci dei valutatori che hanno già eseguito valutazioni per questa execution
    const unique_evaluators = new Set(rlas.map((assignment) => assignment.evaluator_id));

    return assigned_evaluators.length === unique_evaluators.size;
  }

  private aggregateIndicatorRanks(
    rlas: RubricLevelAssignmentEntity[],
  ): Map<number, { sum_rank: number; count: number; data: RubricLevelAssignmentEntity }> {
    const grouped_indicators = new Map<
      number,
      { sum_rank: number; count: number; data: RubricLevelAssignmentEntity }
    >();

    for (const rla of rlas) {
      const ind_id = rla.indicator?.id ?? rla.indicator_id;

      const current = grouped_indicators.get(ind_id) ?? {
        sum_rank: 0,
        count: 0,
        data: rla,
      };

      current.sum_rank += Number(rla.rubric_rank);
      current.count += 1;
      grouped_indicators.set(ind_id, current);
    }

    return grouped_indicators;
  }

  private calculateSubCompetencyTestScores(
    grouped_indicators: Map<number, { sum_rank: number; count: number; data: any }>,
  ): Map<number, { obtained: number; max: number; competency_id?: number }> {
    const sub_competencies_scores = new Map<
      number,
      { obtained: number; max: number; competency_id?: number }
    >();

    for (const indicator_stats of grouped_indicators.values()) {
      const average_RL = indicator_stats.sum_rank / indicator_stats.count;

      const rla = indicator_stats.data;
      const P_ind = rla.indicator?.weight;
      const observation_object = rla.indicator?.observation_object;
      const subcompetency = observation_object?.subcompetency;
      if (!subcompetency) continue;

      const P_sub = subcompetency.weight;
      const P_comp = subcompetency.competency?.weight;

      const weight_sum = Number(P_comp) + Number(P_sub) + Number(P_ind);

      const partial_obtained = weight_sum * average_RL;
      const partial_max = weight_sum * 5;

      const current_subcompetency = sub_competencies_scores.get(subcompetency.id) ?? {
        obtained: 0,
        max: 0,
        competency_id: subcompetency.competency?.id,
      };

      current_subcompetency.obtained += partial_obtained;
      current_subcompetency.max += partial_max;
      sub_competencies_scores.set(subcompetency.id, current_subcompetency);
    }

    return sub_competencies_scores;
  }

  private async upsertSubCompetenciesScores(
    subcompetency_scores: Map<number, { obtained: number; max: number; competency_id?: number }>,
    user_id: number,
  ): Promise<void> {
    for (const [subcomp_id, subcompetency_stats] of subcompetency_scores.entries()) {
      const subcomp_percentage =
        subcompetency_stats.max > 0
          ? (subcompetency_stats.obtained / subcompetency_stats.max) * 100
          : 0;

      await this.bestScoresService.upsertSubCompetencyScores(
        subcomp_id,
        subcompetency_stats.obtained,
        subcomp_percentage,
        user_id,
      );
    }
  }

  private async identifyTestCompetencies(
    subcompetency_scores: Map<number, { obtained: number; max: number; competency_id?: number }>,
  ): Promise<Set<number>> {
    const test_competencies = new Set<number>();

    for (const subcompetency_stats of subcompetency_scores.values()) {
      if (subcompetency_stats.competency_id !== undefined) {
        test_competencies.add(subcompetency_stats.competency_id);
      }
    }

    return test_competencies;
  }

  private async recalculateBestCompetencyScores(
    test_competencies: Set<number>,
    user_id: number,
  ): Promise<void> {
    for (const comp_id of test_competencies) {
      const competency = await this.competencyService.findOne(comp_id);
      if (!competency || !competency.subcompetencies || competency.subcompetencies.length === 0)
        continue;

      let total_obtained = 0;
      let total_max = 0;
      let all_subcompetencies_tested = true;

      for (const subcompetency of competency.subcompetencies) {
        const subcompetency_score = await this.bestScoresService.getSubCompetencyScore(
          subcompetency.id,
          user_id,
        );
        if (!subcompetency_score) {
          all_subcompetencies_tested = false;
          break;
        }
        total_obtained += Number(subcompetency_score.best_score_absolute);
        const percentage = parseFloat(subcompetency_score.best_score_percentage);
        if (percentage > 0) {
          const max = (Number(subcompetency_score.best_score_absolute) / percentage) * 100;
          total_max += max;
        }
      }

      // calcola e salva il punteggio della competenza SOLO se tutte le sotto-competenze sono state testate
      if (all_subcompetencies_tested && total_max > 0) {
        const final_percentage = (total_obtained / total_max) * 100;
        await this.bestScoresService.upsertCompetencyScores(
          comp_id,
          total_obtained,
          final_percentage,
          user_id,
        );
      }
    }
  }

  private async updateTestExecutionScore(
    test_execution_id: number,
    subcompetency_scores: Map<number, { obtained: number; max: number; competency_id?: number }>,
  ): Promise<void> {
    let test_score = 0;
    let max_score = 0;

    for (const stats of subcompetency_scores.values()) {
      test_score += stats.obtained;
      max_score += stats.max;
    }

    await this.testExecutionService.update(test_execution_id, {
      test_score: test_score.toFixed(2),
      max_score: max_score.toFixed(2),
    });
  }

  async getEvaluatorStatus(testId: number, userId: number) {
    const evaluator = await this.testEvaluatorService.findByUserId(userId);
    if (!evaluator) throw new NotFoundException('Evaluator profile not found');
    
    const executions = await this.testExecutionService.findByTest(testId);
    
    const result = [];
    for (const exec of executions) {
      const hasEvaluated = await this.rubricLevelAssignmentsService.hasEvaluated(exec.id, evaluator.id);
      result.push({
        execution_id: exec.id,
        is_evaluated_by_me: hasEvaluated
      });
    }
    return result;
  }

  async getEvaluationsForExecution(executionId: number, userId: number) {
    const evaluator = await this.testEvaluatorService.findByUserId(userId);
    if (!evaluator) throw new NotFoundException('Evaluator profile not found');

    const assignments = await this.rubricLevelAssignmentsService.getEvaluations(executionId, evaluator.id);
    const evaluations: Record<number, number> = {};
    for (const a of assignments) {
      evaluations[a.indicator_id] = a.rubric_rank;
    }
    return evaluations;
  }
}

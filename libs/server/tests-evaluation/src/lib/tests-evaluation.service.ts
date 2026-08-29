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
import { HistoricalScoresService } from '@server/historical-scores';
import { TestExecutionService } from '@server/tests-execution';
import { CompetencyService } from '@server/competencies-management';
import { IndicatorsService } from '@server/competencies-management';
import { SubmitEvaluationDto } from './dto/submit-evaluation.dto';
import { TestEvaluatorService } from './test-evaluator/test-evaluator.service';

@Injectable()
export class TestsEvaluationService {
  constructor(
    private readonly rubricLevelAssignmentsService: RubricLevelAssignmentService,
    private readonly historicalScoresService: HistoricalScoresService,
    private readonly testExecutionService: TestExecutionService,
    private readonly competencyService: CompetencyService,
    private readonly indicatorsService: IndicatorsService,
    private readonly testEvaluatorService: TestEvaluatorService,
    private readonly dataSource: DataSource
  ) {}

  async submitEvaluation(dto: SubmitEvaluationDto, current_user_id?: number) {
    if (!dto.evaluations || dto.evaluations.length === 0) {
      throw new BadRequestException(
        'La richiesta deve contenere almeno una valutazione ad un indicatore.'
      );
    }

    // recupero il valutatore
    let evaluator = null;
    if (dto.evaluator_id) {
      evaluator = await this.testEvaluatorService.findOne(dto.evaluator_id);
    } else if (current_user_id) {
      evaluator = await this.testEvaluatorService.findByUserId(current_user_id);
    }

    if (!evaluator) {
      throw new NotFoundException(
        'Valutatore non trovato o non specificato.'
      );
    }

    // recuper text_execution
    const testExecution = await this.testExecutionService.findOne(
      dto.test_execution_id
    );
    if (!testExecution) {
      throw new NotFoundException(
        `Test Execution con ID ${dto.test_execution_id} non trovata.`
      );
    }

    // verifico che il test esista e ricavo le sue sotto-competenze ammesse
    if (!testExecution.test || !testExecution.test.subcompetencies) {
      throw new BadRequestException(
        'Impossibile recuperare le sotto-competenze associate al test da valutare.'
      );
    }

    const allowedSubcompetencyIds = new Set(
      testExecution.test.subcompetencies.map((s) => s.id)
    );

    // verifico la validità di ogni rubric rank e l'appartenenza dell'indicatore al test
    for (const evaluation of dto.evaluations) {
      // Validazione del rank
      await this.rubricLevelAssignmentsService.validateRubricRank(
        evaluation.indicator_id,
        Number(evaluation.rubric_rank)
      );

      // validazione appartenenza alle sotto-competenze del test
      const indicator = await this.indicatorsService.findOne(evaluation.indicator_id);
      const subcomp_id = indicator.observation_object?.subcompetency_id;

      if (!subcomp_id || !allowedSubcompetencyIds.has(subcomp_id)) {
        throw new BadRequestException(
          `L'indicatore con ID ${evaluation.indicator_id} non appartiene a nessuna delle sotto-competenze previste per questo test.`
        );
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

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
          const newAssignment = manager.create(RubricLevelAssignmentEntity, {
            indicator_id: evaluation.indicator_id,
            test_execution_id: dto.test_execution_id,
            evaluator_id: evaluator.id,
            rubric_rank: evaluation.rubric_rank,
          });
          await manager.save(newAssignment);
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Errore durante il salvataggio delle valutazioni: ${(error as Error).message || 'Operazione annullata.'}`
      );
    } finally {
      await queryRunner.release();
    }

    // ricalcolo i punteggi
    await this.calculateTestScores(dto.test_execution_id, testExecution.user_id);

    return {
      message: 'Valutazione salvata e punteggi ricalcolati con successo.',
      test_execution_id: dto.test_execution_id,
      evaluator_id: evaluator.id,
    };
  }

  async calculateTestScores(test_execution_id: number, user_id: number): Promise<void> {
    // Estrazione di tutti i rubricLevelAssignments relativi ad una test_execution
    const rubricLevelAssignments =
      await this.rubricLevelAssignmentsService.findByTestExecutionWithRelations(test_execution_id);

    if (!rubricLevelAssignments || rubricLevelAssignments.length === 0) {
      return;
    }

    // Aggregazione dei voti dei valutatori per ogni singolo indicatore
    const groupedIndicators = this.aggregateIndicatorRanks(rubricLevelAssignments);

    // Calcolo dei punteggi (ottenuto e massimo) per ogni sotto-competenza associata al test
    const subCompetencyScores = this.calculateSubCompetencyTestScores(groupedIndicators);

    // Inserimento o aggiornamento dei record delle sotto-competenze associate a questo test
    await this.upsertSubCompetenciesScores(subCompetencyScores, user_id);

    // Identificazione delle competenze associate al test
    const testCompetencies = await this.identifyTestCompetencies(subCompetencyScores);

    // Ricalcolo del punteggio storico per ogni competenza associata al test
    await this.recalculateHistoricalCompetencies(testCompetencies, user_id);

    // Aggiornamento del punteggio del test
    await this.updateTestExecutionScore(test_execution_id, subCompetencyScores);
  }

  private aggregateIndicatorRanks(
    rubricLevelAssignments: RubricLevelAssignmentEntity[],
  ): Map<number, { sum_rank: number; count: number; data: RubricLevelAssignmentEntity }> {
    const groupedIndicators = new Map<
      number,
      { sum_rank: number; count: number; data: RubricLevelAssignmentEntity }
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

    return groupedIndicators;
  }

  private calculateSubCompetencyTestScores(
    groupedIndicators: Map<number, { sum_rank: number; count: number; data: any }>,
  ): Map<number, { obtained: number; max: number; competency_id?: number }> {
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

    return subCompetencyScores;
  }

  private async upsertSubCompetenciesScores(
    subCompetencyScores: Map<number, { obtained: number; max: number; competency_id?: number }>,
    user_id: number,
  ): Promise<void> {
    for (const [subcomp_id, subcompStats] of subCompetencyScores.entries()) {
      const subcomp_percentage =
        subcompStats.max > 0 ? (subcompStats.obtained / subcompStats.max) * 100 : 0;

      await this.historicalScoresService.upsertSubCompetencyScores(
        subcomp_id,
        subcompStats.obtained,
        subcomp_percentage,
        user_id,
      );
    }
  }

  private async identifyTestCompetencies(
    subCompetencyScores: Map<number, { obtained: number; max: number; competency_id?: number }>,
  ): Promise<Set<number>> {
    const testCompetencies = new Set<number>();

    for (const subcompStats of subCompetencyScores.values()) {
      if (subcompStats.competency_id !== undefined) {
        testCompetencies.add(subcompStats.competency_id);
      }
    }

    return testCompetencies;
  }

  private async recalculateHistoricalCompetencies(
    testCompetencies: Set<number>,
    user_id: number,
  ): Promise<void> {
    for (const comp_id of testCompetencies) {
      const competency = await this.competencyService.findOne(comp_id);
      if (!competency || !competency.subcompetencies || competency.subcompetencies.length === 0) continue;

      let total_obtained = 0;
      let total_max = 0;
      let allSubCompetenciesTested = true;

      for (const subcomp of competency.subcompetencies) {
        const hist = await this.historicalScoresService.getSubCompetencyScore(subcomp.id, user_id);
        if (!hist) {
          allSubCompetenciesTested = false;
          break;
        }
        total_obtained += Number(hist.score_absolute);
        const perc = parseFloat(hist.score_percentage);
        if (perc > 0) {
          const max = (Number(hist.score_absolute) / perc) * 100;
          total_max += max;
        }
      }

      // Il punteggio della competenza viene calcolato e salvato SOLO se tutte le sotto-competenze sono state testate
      if (allSubCompetenciesTested && total_max > 0) {
        const final_perc = (total_obtained / total_max) * 100;
        await this.historicalScoresService.upsertCompetencyScores(
          comp_id,
          user_id,
          total_obtained,
          final_perc,
        );
      }
    }
  }

  private async updateTestExecutionScore(
    test_execution_id: number,
    subCompetencyScores: Map<number, { obtained: number; max: number; competency_id?: number }>,
  ): Promise<void> {
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

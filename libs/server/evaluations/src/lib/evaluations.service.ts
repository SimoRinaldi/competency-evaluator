import { Injectable } from '@nestjs/common';
import { ServerRubricLevelAssignmentsService } from './rubric-level-assignment.service';
import { ServerBestSubCompetencyScoresService } from './best-subcompetency-score.service';
import { ServerBestCompetencyScoresService } from './best-competency-score.service';

@Injectable()
export class ServerEvaluationsService {
    constructor( 
        private readonly rubricLevelAssignmentsService: ServerRubricLevelAssignmentsService,
        private readonly bestSubCompetencyScoresService: ServerBestSubCompetencyScoresService,
        private readonly bestCompetencyScoresService: ServerBestCompetencyScoresService
    ){}

    async calculateTestScores(test_execution_id: number, user_id: number): Promise<void> {
        const rubricLevelAssignments = await this.rubricLevelAssignmentsService.findByTestExecutionWithRelations(test_execution_id);

        if (!rubricLevelAssignments || rubricLevelAssignments.length === 0) {
            console.log(`Nessun dato trovato per l'esecuzione test ${test_execution_id}`);
            return;
        }

        // Chiave: subcompetency_id | Valore: { obtained: somma, max: somma, competency_id: id_competenza_madre }
        const subCompetencyScores = new Map<number, { obtained: number; max: number; competency_id: number }>();

        for (const rla of rubricLevelAssignments) {
            const RL = rla.rubric_rank;
            const P_ind = rla.indicator.weight;
            const subcomp = rla.indicator.observation_object.subcompetency;
            const P_sub = subcomp.weight;
            const P_comp = subcomp.competency.weight;

            const weight_sum = Number(P_comp) + Number(P_sub) + Number(P_ind);

            const partial_obtained = weight_sum * Number(RL);
            const partial_max = weight_sum * 5;

            if (!subCompetencyScores.has(subcomp.id))
                subCompetencyScores.set(subcomp.id, { obtained: 0, max: 0, competency_id: subcomp.competency.id });

            const current_subcompetency = subCompetencyScores.get(subcomp.id)!;
            current_subcompetency.obtained += partial_obtained;
            current_subcompetency.max += partial_max;
        }

        // Chiave: competency_id | Valore: { obtained: somma, max: somma }
        const competencyScores = new Map<number, { obtained: number; max: number }>();

        for (const [subcomp_id, stats] of subCompetencyScores.entries()) {
            const subcomp_percentage = stats.max > 0 ? (stats.obtained / stats.max) * 100 : 0;

            await this.upsertBestSubCompetencyScores(user_id, subcomp_id, stats.obtained, subcomp_percentage);

            if (!competencyScores.has(stats.competency_id))
                competencyScores.set(stats.competency_id, { obtained: 0, max: 0 });

            const current_competency = competencyScores.get(stats.competency_id)!;
            current_competency.obtained += stats.obtained;
            current_competency.max += stats.max;
        }

        for (const [comp_id, stats] of competencyScores.entries()) {
            const comp_percentage = stats.max > 0 ? (stats.obtained / stats.max) * 100 : 0;

            await this.upsertBestCompetencyScores(user_id, comp_id, stats.obtained, comp_percentage);
        }

        // sistema deve salvare il punteggio totale anche su quella specifica esecuzione del test
        // per aggiornare anche gli attributi di test_execution_test
    }

    private async upsertBestSubCompetencyScores(
        user_id: number, 
        subcompetency_id: number, 
        obtained: number, 
        percentage: number
    ): Promise<void> {
        const existing = await this.bestSubCompetencyScoresService.findByUserAndSubCompetency(user_id, subcompetency_id);
        const percentage_str = percentage.toFixed(2);

        if (!existing) {
            await this.bestSubCompetencyScoresService.create({
                best_score_absolute: obtained,
                best_score_percentage: percentage_str,
                user_id: user_id,
                subcompetency_id: subcompetency_id
            });
        } else if (percentage > Number(existing.best_score_percentage)) {
            await this.bestSubCompetencyScoresService.update(existing.id, {
                best_score_absolute: obtained,
                best_score_percentage: percentage_str
            });
        }
    }

    private async upsertBestCompetencyScores(
        user_id: number, 
        competency_id: number, 
        obtained: number, 
        percentage: number
    ): Promise<void> {
        const existing = await this.bestCompetencyScoresService.findByUserAndCompetency(user_id, competency_id);
        const percentage_str = percentage.toFixed(2);

        if (!existing) {
            await this.bestCompetencyScoresService.create({
                best_score_absolute: obtained,
                best_score_percentage: percentage_str,
                user_id: user_id,
                competency_id: competency_id
            });
        } else if (percentage > Number(existing.best_score_percentage)) {
            await this.bestCompetencyScoresService.update(existing.id, {
                best_score_absolute: obtained,
                best_score_percentage: percentage_str
            });
        }
    }
}
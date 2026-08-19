import { Injectable } from '@nestjs/common';
import { ServerRubricLevelAssignmentsService } from './rubric-level-assignment.service';

@Injectable()
export class ServerEvaluationsService {
    constructor( 
        private readonly rubricLevelAssignmentsService: ServerRubricLevelAssignmentsService
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

        const competencyScores = new Map<number, { obtained: number; max: number }>();

        for (const [subcomp_id, stats] of subCompetencyScores.entries()) {
            const subcomp_percentage = stats.max > 0 ? (stats.obtained / stats.max) * 100 : 0;

            // salvataggio valori sotto-competenza

            if (!competencyScores.has(stats.competency_id))
                competencyScores.set(stats.competency_id, { obtained: 0, max: 0 });

            const current_competency = competencyScores.get(stats.competency_id)!;
            current_competency.obtained += stats.obtained;
            current_competency.max += stats.max;
        }

        for (const [comp_id, stats] of competencyScores.entries()) {
            const comp_percentage = stats.max > 0 ? (stats.obtained / stats.max) * 100 : 0;

            // salvataggio valori competenza
        }
    }
}
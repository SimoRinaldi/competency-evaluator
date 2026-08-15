import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TestEvaluatorEntity } from './test-evaluator.entity';
import { IndicatorEntity } from '@server/rubrics';

@Entity('rubric_level_assignments')
export class RubricLevelAssignmentEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type:'integer', nullable: false })
    rubric_rank: number;

    @ManyToOne(() => IndicatorEntity)
    @JoinColumn({ name: 'indicator_id' })
    indicator: IndicatorEntity; 
    @Column({ type: 'integer', nullable: false })
    indicator_id: number;

    // attributo test_execution_id da aggiungere

    @ManyToOne(() => TestEvaluatorEntity)
    @JoinColumn({ name: 'evaluator_id' })
    evaluator: TestEvaluatorEntity; 
    @Column({ type: 'integer', nullable: false })
    evaluator_id: number;
}
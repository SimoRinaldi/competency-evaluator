import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TestEvaluatorEntity } from '@server/users';
import { IndicatorEntity } from '@server/rubrics';

@Entity('rubric_level_assignments')
export class RubricLevelAssignmentEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type:'integer', nullable: false })
    rubric_rank!: number;

    @ManyToOne(() => IndicatorEntity, (indicator) => indicator.rubric_level_assignments)
    @JoinColumn({ name: 'indicator_id' })
    indicator!: IndicatorEntity; 
    @Column({ type: 'integer', nullable: false })
    indicator_id!: number;

    @ManyToOne(() => TestExecutionEntity, (test_execution) => test_execution.rubric_level_assignments)
    @JoinColumn({ name: 'test_execution_id' })
    test_execution!: TestExecutionEntity; 
    @Column({ type: 'integer', nullable: false })
    test_execution_id!: number;

    @ManyToOne(() => TestEvaluatorEntity, (test_evaluator) => test_evaluator.rubric_level_assignments)
    @JoinColumn({ name: 'evaluator_id' })
    evaluator!: TestEvaluatorEntity; 
    @Column({ type: 'integer', nullable: false })
    evaluator_id!: number;
}
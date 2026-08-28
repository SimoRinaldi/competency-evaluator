import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { TestEvaluatorEntity } from '../../test-evaluator/entities/test-evaluator.entity';
import { IndicatorEntity } from '@server/competencies-management';
import { TestExecutionEntity } from '@server/tests-execution';

@Entity('rubric_level_assignment')
export class RubricLevelAssignmentEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer', nullable: false })
  rubric_rank!: number;

  @Column({ type: 'integer', nullable: false })
  indicator_id!: number;

  @Column({ type: 'integer', nullable: false })
  test_execution_id!: number;

  @Column({ type: 'integer', nullable: false })
  evaluator_id!: number;

  @ManyToOne(() => IndicatorEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'indicator_id' })
  indicator?: Relation<IndicatorEntity>;

  @ManyToOne(() => TestExecutionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'test_execution_id' })
  test_execution?: Relation<TestExecutionEntity>;

  @ManyToOne(() => TestEvaluatorEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'evaluator_id' })
  evaluator?: Relation<TestEvaluatorEntity>;
}

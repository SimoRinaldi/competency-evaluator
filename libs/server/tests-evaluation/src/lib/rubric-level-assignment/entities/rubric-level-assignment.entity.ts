import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { TestEvaluatorEntity } from '@server/users';
import { IndicatorEntity } from '@server/competencies-management';
import { TestExecutionEntity } from '@server/tests-execution';

@Entity('rubric_level_assignments')
export class RubricLevelAssignmentEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer', nullable: false })
  rubric_rank!: number;

  @ManyToOne(() => IndicatorEntity)
  @JoinColumn({ name: 'indicator_id' })
  indicator?: Relation<IndicatorEntity>;

  @Column({ type: 'integer', nullable: false })
  indicator_id!: number;

  @ManyToOne(() => TestExecutionEntity)
  @JoinColumn({ name: 'test_execution_id' })
  test_execution?: Relation<TestExecutionEntity>;

  @Column({ type: 'integer', nullable: false })
  test_execution_id!: number;

  @ManyToOne(() => TestEvaluatorEntity)
  @JoinColumn({ name: 'evaluator_id' })
  evaluator?: Relation<TestEvaluatorEntity>;

  @Column({ type: 'integer', nullable: false })
  evaluator_id!: number;
}

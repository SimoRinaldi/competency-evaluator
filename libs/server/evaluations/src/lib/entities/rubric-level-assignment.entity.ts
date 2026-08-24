import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TestEvaluatorEntity } from '@server/users';
import { IndicatorEntity } from '@server/rubrics';
import { TestExecutionEntity } from '@server/test-management';

@Entity('rubric_level_assignments')
export class RubricLevelAssignmentEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer', nullable: false })
  rubric_rank!: number;

  @ManyToOne(() => IndicatorEntity)
  @JoinColumn({ name: 'indicator_id' })
  indicator!: IndicatorEntity;
  @Column({ type: 'integer', nullable: false })
  indicator_id!: number;

  @ManyToOne(() => TestExecutionEntity)
  @JoinColumn({ name: 'test_execution_id' })
  test_execution!: TestExecutionEntity;
  @Column({ type: 'integer', nullable: false })
  test_execution_id!: number;

  @ManyToOne(() => TestEvaluatorEntity)
  @JoinColumn({ name: 'evaluator_id' })
  evaluator!: TestEvaluatorEntity;
  @Column({ type: 'integer', nullable: false })
  evaluator_id!: number;
}


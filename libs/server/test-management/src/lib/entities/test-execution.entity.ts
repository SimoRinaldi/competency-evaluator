import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { EvaluatedUserEntity } from '@server/users';
import { TestEntity } from './test.entity';
import { TestOutputEntity } from './test-output.entity';
import { RubricLevelAssignmentEntity } from '@server/evaluations';

@Entity('test_executions')
export class TestExecutionEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => TestEntity, (test) => test.test_executions)
  @JoinColumn({ name: 'test_id' })
  test!: TestEntity;

  @Column({ type: 'integer', nullable: false })
  test_id!: number;

  @ManyToOne(() => EvaluatedUserEntity, (user) => user.test_executions)
  @JoinColumn({ name: 'user_id' })
  evaluated_user!: EvaluatedUserEntity;

  @Column({ type: 'integer', nullable: false })
  user_id!: number;

  @Column({ type: 'numeric', nullable: true })
  test_score?: string | null;

  @Column({ type: 'numeric', nullable: true })
  max_score?: string | null;

  @OneToMany(() => RubricLevelAssignmentEntity, (rla) => rla.test_execution)
  rubric_level_assignments?: RubricLevelAssignmentEntity[];

  @OneToMany(() => TestOutputEntity, (output) => output.test_execution)
  test_outputs?: TestOutputEntity[];
}

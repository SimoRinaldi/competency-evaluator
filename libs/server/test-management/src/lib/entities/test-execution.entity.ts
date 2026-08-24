import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { EvaluatedUserEntity } from '@server/users';
import { TestEntity } from './test.entity';
import { TestOutputEntity } from './test-output.entity';

@Entity('test_executions')
export class TestExecutionEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => TestEntity, (test) => test.test_executions)
  @JoinColumn({ name: 'test_id' })
  test?: Relation<TestEntity>;

  @Column({ type: 'integer', nullable: false })
  test_id!: number;

  @ManyToOne(() => EvaluatedUserEntity)
  @JoinColumn({ name: 'user_id' })
  evaluated_user?: Relation<EvaluatedUserEntity>;

  @Column({ type: 'integer', nullable: false })
  user_id!: number;

  @Column({ type: 'numeric', nullable: true })
  test_score?: string | null;

  @Column({ type: 'numeric', nullable: true })
  max_score?: string | null;

  @OneToMany(() => TestOutputEntity, (output) => output.test_execution)
  test_outputs?: Relation<TestOutputEntity>[];
}


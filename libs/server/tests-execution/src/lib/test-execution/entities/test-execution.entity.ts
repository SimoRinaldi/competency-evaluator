import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { EvaluatedUserEntity } from '../../evaluated-user/entities/evaluated-user.entity';
import { TestOutputEntity } from '../../test-output/entities/test-output.entity';
import { TestEntity } from '@server/tests-management';

@Entity('test_execution')
export class TestExecutionEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer', nullable: false })
  test_id!: number;

  @Column({ type: 'integer', nullable: false })
  user_id!: number;

  @Column({ type: 'numeric', nullable: true })
  test_score?: string | null;

  @Column({ type: 'numeric', nullable: true })
  max_score?: string | null;

  @ManyToOne(() => TestEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'test_id' })
  test?: Relation<TestEntity>;

  @ManyToOne(() => EvaluatedUserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  evaluated_user?: Relation<EvaluatedUserEntity>;

  @OneToMany(() => TestOutputEntity, (output) => output.test_execution)
  test_outputs?: Relation<TestOutputEntity>[];
}

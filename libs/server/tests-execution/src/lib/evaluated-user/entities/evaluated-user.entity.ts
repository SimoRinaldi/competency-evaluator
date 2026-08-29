import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { UserEntity } from '@server/users';
import { TestExecutionEntity } from '../../test-execution/entities/test-execution.entity';

@Entity('evaluated_user')
export class EvaluatedUserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer', nullable: false, unique: true })
  user_id!: number;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: Relation<UserEntity>;

  @OneToMany(() => TestExecutionEntity, (execution) => execution.evaluated_user)
  test_executions?: Relation<TestExecutionEntity>[];
}

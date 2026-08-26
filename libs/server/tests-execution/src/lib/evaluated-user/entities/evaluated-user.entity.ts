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

@Entity('evaluated_users')
export class EvaluatedUserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user!: Relation<UserEntity>;

  @Column({ type: 'integer', nullable: false, unique: true })
  user_id!: number;

  @OneToMany(() => TestExecutionEntity, (execution) => execution.evaluated_user)
  test_executions?: Relation<TestExecutionEntity>[];
}

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
import { RubricLevelAssignmentEntity } from '../../rubric-level-assignment/entities/rubric-level-assignment.entity';

@Entity('test_evaluators')
export class TestEvaluatorEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user!: Relation<UserEntity>;

  @Column({ type: 'integer', nullable: false, unique: true })
  user_id!: number;

  @OneToMany(
    () => RubricLevelAssignmentEntity,
    (assignment) => assignment.evaluator
  )
  assignments?: Relation<RubricLevelAssignmentEntity>[];
}

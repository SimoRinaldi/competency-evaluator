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

@Entity('test_evaluator')
export class TestEvaluatorEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer', nullable: false, unique: true })
  user_id!: number;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: Relation<UserEntity>;

  @OneToMany(
    () => RubricLevelAssignmentEntity,
    (assignment) => assignment.evaluator
  )
  assignments?: Relation<RubricLevelAssignmentEntity>[];
}

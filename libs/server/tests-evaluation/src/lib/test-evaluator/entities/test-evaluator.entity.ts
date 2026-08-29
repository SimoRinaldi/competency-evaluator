import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { UserEntity } from '@server/users';
import { RubricLevelAssignmentEntity } from '../../rubric-level-assignment/entities/rubric-level-assignment.entity';
import { TestEntity } from '@server/tests-management';

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

  @ManyToMany(() => TestEntity)
  @JoinTable({
    name: 'test_evaluation',
    joinColumn: {
      name: 'test_evaluator_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'test_id',
      referencedColumnName: 'id',
    },
  })
  tests?: Relation<TestEntity>[];
}

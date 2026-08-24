import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { UserEntity } from '@server/users';
import { RubricLevelAssignmentEntity } from './rubric-level-assignment.entity';

@Entity('test_evaluators')
export class TestEvaluatorEntity {
  @PrimaryGeneratedColumn()
  id!: number;
  
  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;
  @Column({ type: 'integer', nullable: false, unique: true }) 
  user_id!: number;

  @OneToMany(() => RubricLevelAssignmentEntity, (rla) => rla.evaluator)
  rubric_level_assignments?: RubricLevelAssignmentEntity[];
}
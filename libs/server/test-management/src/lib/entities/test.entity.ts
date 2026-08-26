import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { TestDesignerEntity, TestEvaluatorEntity } from '@server/users';
import { SubCompetencyEntity } from '@server/competencies';
import { TestExecutionEntity } from './test-execution.entity';

@Entity('tests')
export class TestEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', nullable: false })
  assessment_situation!: string;

  @ManyToOne(() => TestDesignerEntity)
  @JoinColumn({ name: 'test_designer_id' })
  test_designer?: Relation<TestDesignerEntity>;

  @Column({ type: 'integer', nullable: false })
  test_designer_id!: number;

  @OneToMany(() => TestExecutionEntity, (execution) => execution.test)
  test_executions?: Relation<TestExecutionEntity>[];

  @ManyToMany(() => SubCompetencyEntity)
  @JoinTable({
    name: 'test_subcompetency',
    joinColumn: {
      name: 'test_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'subcompetency_id',
      referencedColumnName: 'id',
    },
  })
  subcompetencies?: Relation<SubCompetencyEntity>[];

  @ManyToMany(() => TestEvaluatorEntity)
  @JoinTable({
    name: 'test_evaluations',
    joinColumn: {
      name: 'test_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'test_evaluator_id',
      referencedColumnName: 'id',
    },
  })
  evaluators?: Relation<TestEvaluatorEntity>[];
}


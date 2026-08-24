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
import { TestDesignerEntity } from '@server/users';
import { TestExecutionEntity } from './test-execution.entity';

@Entity('tests')
export class TestEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', nullable: false })
  assessment_situation!: string;
  // Attributi richiesti in assessment_situation (vedi slide):
  // Deve contenere obbligatoriamente:
  // - luogo di svolgimento (on line, in presenza, tipologia di aula, se servono pc...)
  // - tempo di somministrazione
  // - materiale necessario
  // - numero di esaminatori e se devono essere esperti della materia
  // (la pagina per l'inserimento del testo dovrà quindi riportare esplicitamente tali indicazioni a titolo informativo)

  @ManyToOne(() => TestDesignerEntity)
  @JoinColumn({ name: 'test_designer_id' })
  test_designer!: TestDesignerEntity;

  @Column({ type: 'integer', nullable: false })
  test_designer_id!: number;

  @OneToMany(() => TestExecutionEntity, (execution) => execution.test)
  test_executions!: TestExecutionEntity[];

  @ManyToMany(() => TestEvaluatorEntity)
  @JoinTable({
    name: 'test_evaluator_test',
    joinColumn: {
      name: 'test_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'test_evaluator_id',
      referencedColumnName: 'id',
    },
  })
  evaluators?: TestEvaluatorEntity[];
}

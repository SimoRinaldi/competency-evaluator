import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { TestDesignerEntity } from './test-designer.entity';
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
  // TODO: valutare se mettere degli attributi apposta nell'entità o lasciarlo cosi

  @ManyToOne(() => TestDesignerEntity, (designer) => designer.tests)
  @JoinColumn({ name: 'test_designer_id' })
  test_designer!: TestDesignerEntity;

  @Column({ type: 'integer', nullable: false })
  test_designer_id!: number;

  @OneToMany(() => TestExecutionEntity, (execution) => execution.test)
  test_executions!: TestExecutionEntity[];

  // Relazione ManyToMany con SubcompetencyEntity (JoinTable: test_subcompetency)
  // Sarà attivata al momento dell'integrazione del modulo competenze (COEVA-03-competenze)
  /*
  @ManyToMany(() => SubcompetencyEntity)
  @JoinTable({
    name: 'test_subcompetency',
    joinColumn: { name: 'test_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'subcompetency_id', referencedColumnName: 'id' }
  })
  subcompetencies!: SubcompetencyEntity[];
  */
}

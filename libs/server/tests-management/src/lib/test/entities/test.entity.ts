import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { TestDesignerEntity } from '../../test-designer/entities/test-designer.entity';
import { SubCompetencyEntity } from '@server/competencies-management';

@Entity('test')
export class TestEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', nullable: false })
  assessment_situation!: string;

  @Column({ type: 'integer', nullable: false })
  test_designer_id!: number;

  @ManyToOne(() => TestDesignerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'test_designer_id' })
  test_designer?: Relation<TestDesignerEntity>;

  @ManyToMany(() => SubCompetencyEntity, { cascade: true })
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
}


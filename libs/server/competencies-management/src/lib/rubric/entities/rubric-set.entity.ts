import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import type { Relation } from 'typeorm';
import { RubricLevelEntity } from './rubric-level.entity';
import { IndicatorEntity } from '../../indicator/entities/indicator.entity';

@Entity('rubric_set')
export class RubricSetEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'boolean', default: false })
  yes_no!: boolean;

  @OneToMany(() => RubricLevelEntity, (level) => level.rubric_set, {
    cascade: true,
    orphanedRowAction: 'delete', // cancella i livelli che non appartengono piu al rubric_set (ad esempio quando un rubric set diventa binario)
  })
  levels?: Relation<RubricLevelEntity>[];

  @OneToMany(() => IndicatorEntity, (indicator) => indicator.rubric_set)
  indicators?: Relation<IndicatorEntity>[];
}

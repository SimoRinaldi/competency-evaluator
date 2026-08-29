import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { IndicatorEntity } from '../../indicator/entities/indicator.entity';
import { SubCompetencyEntity } from '../../subcompetency/entities/subcompetency.entity';

@Entity('observation_object')
export class ObservationObjectEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', nullable: false })
  description!: string;

  @Column({ type: 'integer', nullable: false })
  subcompetency_id!: number;

  @OneToMany(
    () => IndicatorEntity,
    (indicator) => indicator.observation_object,
    {
      cascade: true,
      orphanedRowAction: 'delete', // cancella gli indicatori rimossi dall'array durante un update
    }
  )
  indicators?: Relation<IndicatorEntity>[];

  @OneToOne(() => SubCompetencyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subcompetency_id' })
  subcompetency?: Relation<SubCompetencyEntity>;
}

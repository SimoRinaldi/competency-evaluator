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

@Entity('observation_objects')
export class ObservationObjectEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', nullable: false })
  description!: string;

  @OneToMany(
    () => IndicatorEntity,
    (indicator) => indicator.observation_object,
    {
      cascade: true,
    }
  )
  indicators?: Relation<IndicatorEntity>[];

  @OneToOne(() => SubCompetencyEntity)
  @JoinColumn({ name: 'subcompetency_id' })
  subcompetency?: Relation<SubCompetencyEntity>;

  @Column({ type: 'integer', nullable: false })
  subcompetency_id!: number;
}

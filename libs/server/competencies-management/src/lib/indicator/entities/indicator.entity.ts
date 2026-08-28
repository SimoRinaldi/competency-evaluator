import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { RubricSetEntity } from '../../rubric/entities/rubric-set.entity';
import { ObservationObjectEntity } from '../../observation-object/entities/observation-object.entity';

@Entity('indicator')
export class IndicatorEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', nullable: false })
  description!: string;

  @Column({ type: 'integer', nullable: false })
  weight!: number;

  @Column({ type: 'integer', nullable: false })
  rubric_set_id!: number;

  @Column({ type: 'integer', nullable: false })
  observation_object_id!: number;

  @ManyToOne(() => RubricSetEntity, (rubric_set) => rubric_set.indicators)
  @JoinColumn({ name: 'rubric_set_id' })
  rubric_set?: Relation<RubricSetEntity>;

  @ManyToOne(
    () => ObservationObjectEntity,
    (observation_object) => observation_object.indicators,
    {
      onDelete: 'CASCADE',
    }
  )
  @JoinColumn({ name: 'observation_object_id' })
  observation_object?: Relation<ObservationObjectEntity>;
}

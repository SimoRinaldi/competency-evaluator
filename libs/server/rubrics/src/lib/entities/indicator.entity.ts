import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Relation,
} from 'typeorm';
import { RubricSetEntity } from './rubric-set.entity';
import { ObservationObjectEntity } from './observation-object.entity';
import { RubricLevelAssignmentEntity } from '@server/evaluations';

@Entity('indicators')
export class IndicatorEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', nullable: false })
  description!: string;

  @Column({ type: 'integer', nullable: false })
  weight!: number;

  @ManyToOne(() => RubricSetEntity, (rubric_set) => rubric_set.indicators)
  @JoinColumn({ name: 'rubric_set_id' })
  rubric_set!: RubricSetEntity;
  @Column({ type: 'integer', nullable: false })
  rubric_set_id!: number;

  @ManyToOne(
    () => ObservationObjectEntity,
    (observation_object) => observation_object.indicators,
    {
      onDelete: 'CASCADE',
    }
  )
  @JoinColumn({ name: 'observation_object_id' })
  observation_object!: ObservationObjectEntity;
  @Column({ type: 'integer', nullable: false })
  observation_object_id!: number;

  @OneToMany(() => RubricLevelAssignmentEntity, (rla) => rla.indicator)
  rubric_level_assignments?: Relation<RubricLevelAssignmentEntity>[];
}

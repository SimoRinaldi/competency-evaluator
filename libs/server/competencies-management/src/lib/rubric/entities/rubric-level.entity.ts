import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { RubricSetEntity } from './rubric-set.entity';

@Entity('rubric_level')
export class RubricLevelEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  description!: string;

  @Column({ type: 'integer', nullable: false })
  rank!: number;

  @Column({ type: 'integer', nullable: false })
  rubric_set_id!: number;

  @ManyToOne(() => RubricSetEntity, (rubricSet) => rubricSet.levels, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'rubric_set_id' })
  rubric_set?: Relation<RubricSetEntity>;
}

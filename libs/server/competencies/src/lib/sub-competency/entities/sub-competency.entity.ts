import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { CompetencyEntity } from '../../competency/entities/competency.entity';

@Entity('sub_competencies')
export class SubCompetencyEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: true,
    default: 'Unknown',
  })
  title!: string;

  @Column({ type: 'int', nullable: false })
  weight!: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  input?: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  output?: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  action?: string;

  @Column({ type: 'int', nullable: false })
  competency_id!: number;

  @ManyToOne(() => CompetencyEntity, (competency) => competency.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'competency_id' })
  competency?: Relation<CompetencyEntity>;
}

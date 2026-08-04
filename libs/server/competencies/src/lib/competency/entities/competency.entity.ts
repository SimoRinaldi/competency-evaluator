import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Relation,
} from 'typeorm';
import { SubCompetency } from '../../sub-competency/entities/sub-competency.entity';

@Entity('competencies')
export class Competency {
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

  @OneToMany(() => SubCompetency, (sub_competency) => sub_competency.id)
  sub_competencies?: Relation<SubCompetency>[];
}

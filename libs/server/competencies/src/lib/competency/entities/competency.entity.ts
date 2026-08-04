import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Relation,
} from 'typeorm';
import { SubCompetencyEntity } from '../../sub-competency/entities/sub-competency.entity';

@Entity('competencies')
export class CompetencyEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: true
  })
  title!: string;

  @Column({ type: 'int', nullable: false })
  weight!: number;

  @OneToMany(() => SubCompetencyEntity, (sub_competency) => sub_competency.id)
  sub_competencies?: Relation<SubCompetencyEntity>[];
}

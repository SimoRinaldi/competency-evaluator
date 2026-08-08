import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Relation,
} from 'typeorm';
import { SubCompetencyEntity } from '../../subcompetency/entities/subcompetency.entity';

@Entity('competencies')
export class CompetencyEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: true,
  })
  title!: string;

  @Column({ type: 'int', nullable: false })
  weight!: number;

  // Una competency ha molte subcompetencies
  @OneToMany(
    () => SubCompetencyEntity,
    (subCompetency) => subCompetency.competency
  )
  subcompetencies?: Relation<SubCompetencyEntity>[];
}

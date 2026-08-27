import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Relation,
} from 'typeorm';
import { SubCompetencyEntity } from '../../subcompetency/entities/subcompetency.entity';

@Entity('competency')
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

  @Column({ type: 'integer', nullable: false })
  weight!: number;

  @Column( {type: 'integer', nullable: false } )
  threshold!: number;

  // Una competency ha molte subcompetencies
  @OneToMany(
    () => SubCompetencyEntity,
    (subCompetency) => subCompetency.competency
  )
  subcompetencies?: Relation<SubCompetencyEntity>[];
}


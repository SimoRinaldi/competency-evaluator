import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { UserEntity } from '@server/users';
import { SubCompetencyEntity } from '@server/competencies-management';

@Entity('subcompetency_historical_score')
export class SubCompetencyHistoricalScoreEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer', nullable: false })
  score_absolute!: number;

  @Column({ type: 'numeric', nullable: false })
  score_percentage!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user?: Relation<UserEntity>;

  @Column({ type: 'integer', nullable: false })
  user_id!: number;

  @ManyToOne(() => SubCompetencyEntity)
  @JoinColumn({ name: 'subcompetency_id' })
  subcompetency?: Relation<SubCompetencyEntity>;

  @Column({ type: 'integer', nullable: false })
  subcompetency_id!: number;
}

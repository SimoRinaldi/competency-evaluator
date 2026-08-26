import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { UserEntity } from '@server/users';
import { CompetencyEntity } from '@server/competencies';

@Entity('competency_historical_scores')
export class CompetencyHistoricalScoreEntity {
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

  @ManyToOne(() => CompetencyEntity)
  @JoinColumn({ name: 'competency_id' })
  competency?: Relation<CompetencyEntity>;

  @Column({ type: 'integer', nullable: false })
  competency_id!: number;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { UserEntity } from '@server/users';
import { CompetencyEntity } from '@server/competencies-management';

@Entity('competency_historical_score')
export class CompetencyHistoricalScoreEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer', nullable: false })
  score_absolute!: number;

  @Column({ type: 'numeric', nullable: false })
  score_percentage!: string;

  @Column({ type: 'integer', nullable: false })
  user_id!: number;

  @Column({ type: 'integer', nullable: false })
  competency_id!: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: Relation<UserEntity>;

  @ManyToOne(() => CompetencyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'competency_id' })
  competency?: Relation<CompetencyEntity>;
}

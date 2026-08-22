import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { UserEntity } from '../user.entity';

@Entity('evaluated_users')
export class EvaluatedUserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: Relation<UserEntity>;

  @Column({ type: 'integer', nullable: false, unique: true })
  user_id!: number;
}

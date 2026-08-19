import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { UserEntity } from '@server/users';
import { TestEntity } from './test.entity';

@Entity('test_designers')
export class TestDesignerEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ type: 'integer', nullable: false, unique: true })
  user_id!: number;

  @OneToMany(() => TestEntity, (test) => test.test_designer)
  tests!: TestEntity[];
}

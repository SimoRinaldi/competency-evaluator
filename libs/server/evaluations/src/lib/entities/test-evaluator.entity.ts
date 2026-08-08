import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { UserEntity } from '@server/users';

@Entity('test_evaluators')
export class TestEvaluatorEntity {
  @PrimaryGeneratedColumn()
  id: number;
  
  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
  @Column({ type: 'integer', nullable: false, unique: true }) 
  user_id: number;

  // relazione ManyToMany con test
  @ManyToMany(() => TestEntity)
  @JoinTable({
    name: 'test_evaluator_test',
    joinColumn: {
      name: 'test_evaluator_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'test_id',
      referencedColumnName: 'id'
    }
  })
  tests: TestEntity[];
}
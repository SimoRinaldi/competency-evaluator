import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TestExecutionEntity } from './test-execution.entity';

@Entity('test_outputs')
export class TestOutputEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  url?: string;

  @Column({ type: 'integer', nullable: false })
  test_execution_id!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  version?: string;

  @ManyToOne(() => TestExecutionEntity, (execution) => execution.test_outputs)
  @JoinColumn({ name: 'test_execution_id' })
  test_execution!: TestExecutionEntity;
}

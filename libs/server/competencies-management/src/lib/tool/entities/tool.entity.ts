import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tool')
export class ToolEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  name!: string;
}

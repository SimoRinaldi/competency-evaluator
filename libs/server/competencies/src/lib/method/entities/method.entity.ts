import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('methods')
export class MethodEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  name!: string;
}

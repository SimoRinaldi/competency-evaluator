import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('skill')
export class SkillEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  name!: string;
}

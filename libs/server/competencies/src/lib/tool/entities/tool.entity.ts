import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tools')
export class Tool {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
    name!: string;
}

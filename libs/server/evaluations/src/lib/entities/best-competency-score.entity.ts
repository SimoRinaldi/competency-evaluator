import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '@server/users';

@Entity('best_competency_scores')
export class BestCompetencyScoreEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type:'integer', nullable: false})
    best_score_absolute: number;

    @Column({type: 'numeric', nullable: false})
    best_score_percentage: string; 

    @ManyToOne(() => UserEntity)
    @JoinColumn({name: 'user_id'})
    user: UserEntity;

    @Column({type: 'integer', nullable: false})
    user_id: number

    // attributo competency_id da aggiungere
}
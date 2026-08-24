import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '@server/users';

@Entity('best_subcompetency_scores')
export class BestSubCompetencyScoreEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type:'integer', nullable: false})
    best_score_absolute!: number;

    @Column({type: 'numeric', nullable: false})
    best_score_percentage!: string; 

    @ManyToOne(() => UserEntity)
    @JoinColumn({name: 'user_id'})
    user!: UserEntity;

    @Column({type: 'integer', nullable: false})
    user_id!: number;

    @ManyToOne(() => SubCompetencyEntity, (subcompetency) => subcompetency.best_subcompetency_scores)
    @JoinColumn({name: 'subcompetency_id'})
    subcompetency!: SubCompetencyEntity;
    @Column({type: 'integer', nullable: false})
    subcompetency_id!: number;
}
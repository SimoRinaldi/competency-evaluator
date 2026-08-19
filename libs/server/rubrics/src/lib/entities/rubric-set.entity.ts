import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { RubricLevelEntity } from './rubric-level.entity'; 
import { IndicatorEntity } from './indicator.entity'

@Entity('rubric_sets')
export class RubricSetEntity {
    @PrimaryGeneratedColumn()                                                                            
    id: number;                                                                                          
                                                                                                                                                                                 
    @Column({type: 'boolean', default: false})                                                         
    yes_no: boolean; 
                                                 
    @OneToMany(() => RubricLevelEntity, (level) => level.rubricSet, {                                          
        cascade: true,                      
    })                                                                                                   
    levels: RubricLevelEntity[]; 

    @OneToMany(() => IndicatorEntity, (indicator) => indicator.rubricSet)
    indicators: IndicatorEntity[];
}
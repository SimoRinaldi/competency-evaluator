import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { RubricLevelEntity } from './rubric-level.entity'; 
import { IndicatorEntity } from '../../indicators/entities/indicator.entity'

@Entity('rubric_sets')
export class RubricSetEntity {
    @PrimaryGeneratedColumn()                                                                            
    id: number;                                                                                          
                                                                                                                                                                                 
    @Column({type: 'boolean', default: false})                                                         
    yes_no: boolean; 

    // Un RubricSet ha MOLTI RubricLevel                                                   
    @OneToMany(() => RubricLevelEntity, (level) => level.rubricSet, {                                          
        cascade: true,                      
    })                                                                                                   
    levels: RubricLevelEntity[]; 

    // Un RubricSet è associato a molti Indicator
    @OneToMany(() => IndicatorEntity, (indicator) => indicator.rubricSet)
    indicators: IndicatorEntity[];
}

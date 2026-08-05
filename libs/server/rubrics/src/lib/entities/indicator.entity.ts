import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';                                                                                                                                        
import { RubricSetEntity } from '../../rubrics/entities/rubric-set.entity';                                             
import { ObservationObjectEntity } from '../../observation-objects/entities/observation-object.entity';                     
                                                                                                                          
@Entity('indicators')                                                                                                  
export class IndicatorEntity {                                                                                                                                                                                                          
    @PrimaryGeneratedColumn()                                                                                           
    id: number;                                                                                                        
                                                                                                                        
    @Column({type: 'text'})                                                                                           
    description: string;                                                                                               
                                                                                                                                                                                                  
    @Column({type: 'int'})                                                                                            
    weight: number;                                                                                                                                                                                                   
                
    // Relazione con RubricSet
    @ManyToOne(() => RubricSetEntity, (rubricSet) => rubricSet.indicators)                                                    
    @JoinColumn({ name: 'rubric_set_id' })                                                                              
    rubricSet: RubricSetEntity;                                                                                                                                                                                                                                                              
    @Column()                                                                                                           
    rubric_set_id: number;                                                                                             
                                                                                                                                                                                                                                           
    // Relazione con ObservationObject                                                                               
    @ManyToOne(() => ObservationObjectEntity, (observationObject) => observationObject.indicators, {                          
        onDelete: 'CASCADE',              
    })                                                                                                                  
    @JoinColumn({ name: 'observation_object_id' })                                                                      
    observationObject: ObservationObjectEntity;                                                                                                                                                                                                                                               
    @Column()                                                                                                           
    observation_object_id: number;                                                                                     
}  
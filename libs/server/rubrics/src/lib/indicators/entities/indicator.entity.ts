import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';                                                                                                                                        
import { RubricSet } from '../../rubrics/entities/rubric-set.entity';                                             
import { ObservationObject } from '../../observation-objects/entities/observation-object.entity';                     
                                                                                                                          
@Entity('indicator')                                                                                                  
export class Indicator {                                                                                                                                                                                                          
    @PrimaryGeneratedColumn()                                                                                           
    id: number;                                                                                                        
                                                                                                                        
    @Column({type: 'text'})                                                                                           
    description: string;                                                                                               
                                                                                                                                                                                                  
    @Column({type: 'int'})                                                                                            
    weight: number;                                                                                                                                                                                                   
                
    // Relazione con RubricSet
    @ManyToOne(() => RubricSet, (rubricSet) => rubricSet.indicators)                                                    
    @JoinColumn({ name: 'rubric_set_id' })                                                                              
    rubricSet: RubricSet;                                                                                                                                                                                                                                                              
    @Column()                                                                                                           
    rubric_set_id: number;                                                                                             
                                                                                                                                                                                                                                           
    // Relazione con ObservationObject                                                                               
    @ManyToOne(() => ObservationObject, (observationObject) => observationObject.indicators, {                          
        onDelete: 'CASCADE',              
    })                                                                                                                  
    @JoinColumn({ name: 'observation_object_id' })                                                                      
    observationObject: ObservationObject;                                                                                                                                                                                                                                               
    @Column()                                                                                                           
    observation_object_id: number;                                                                                     
}  

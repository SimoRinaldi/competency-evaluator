import {Column, Entity, PrimaryGeneratedColumn, OneToMany} from 'typeorm';    
import { IndicatorEntity } from './indicator.entity'                                                    
                                                                                                           
@Entity('observation_objects')                                                                          
export class ObservationObjectEntity {                                                                       
    @PrimaryGeneratedColumn()                                                                            
    id: number;                                                                                         
                                                                                                                                                  
    @Column({type: 'text', nullable: true})                                                            
    description: string;          
    
    @OneToMany(() => IndicatorEntity, (indicator) => indicator.observationObject)
    indicators: IndicatorEntity[];
}      
import {Column, Entity, PrimaryGeneratedColumn, OneToMany} from 'typeorm';    
import { Indicator } from '../../indicators/entities/indicator.entity'                                                    
                                                                                                           
@Entity('observation_object')                                                                          
export class ObservationObject {                                                                       
    @PrimaryGeneratedColumn()                                                                            
    id: number;                                                                                         
                                                                                                                                                  
    @Column({type: 'text', nullable: true})                                                            
    description: string;          
    
    @OneToMany(() => Indicator, (indicator) => indicator.observationObject)
    indicators: Indicator[];
}                                           
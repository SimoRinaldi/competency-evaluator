import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';                                                        
                                                                                                           
@Entity('observation_object')                                                                          
export class ObservationObject {                                                                       
    @PrimaryGeneratedColumn()                                                                            
    id: number;                                                                                         
                                                                                                                                                  
    @Column({type: 'text', nullable: true})                                                            
    description: string;                                      
}                                           
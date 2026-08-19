import {Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn} from 'typeorm';    
import { IndicatorEntity } from './indicator.entity'                                                    
                                                                                                           
@Entity('observation_objects')                                                                          
export class ObservationObjectEntity {                                                                       
    @PrimaryGeneratedColumn()                                                                            
    id: number;                                                                                         
                                                                                                                                                  
    @Column({type: 'text', nullable: true})                                                            
    description: string;          
    
    @OneToMany(() => IndicatorEntity, (indicator) => indicator.observation_object)
    indicators: IndicatorEntity[];

    // Relazione con SubCompetency
    @ManyToOne(() => SubCompetencyEntity)
    @JoinColumn({ name: 'subcompetency_id' })
    subcompetency: SubCompetencyEntity;
    @Column()                                                                                                           
    subcompetency_id: number; 
}      
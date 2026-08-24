import {Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn} from 'typeorm';    
import { IndicatorEntity } from './indicator.entity'                                                    
                                                                                                           
@Entity('observation_objects')                                                                          
export class ObservationObjectEntity {                                                                       
    @PrimaryGeneratedColumn()                                                                            
    id!: number;                                                                                         
                                                                                                                                                  
    @Column({type: 'varchar', length: 255, nullable: false})                                                            
    description!: string;          
    
    @OneToMany(() => IndicatorEntity, (indicator) => indicator.observation_object, {
        cascade: true
    })
    indicators!: IndicatorEntity[];

    @ManyToOne(() => SubCompetencyEntity)
    @JoinColumn({ name: 'subcompetency_id' })
    subcompetency!: SubCompetencyEntity;
    @Column({type: 'integer', nullable: false})                                                                                                           
    subcompetency_id!: number; 
}      
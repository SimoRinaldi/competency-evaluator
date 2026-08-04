import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { RubricLevel } from './rubric-level.entity'; 

@Entity('rubric_set')
export class RubricSet {
    @PrimaryGeneratedColumn()                                                                            
    id: number;                                                                                          
                                                                                                                                                                                 
    @Column({type: 'boolean', default: false})                                                         
    yes_no: boolean; 

    // Un RubricSet ha MOLTI RubricLevel                                                   
    @OneToMany(() => RubricLevel, (level) => level.rubricSet, {                                          
        cascade: true,                      
    })                                                                                                   
    levels: RubricLevel[]; 
}

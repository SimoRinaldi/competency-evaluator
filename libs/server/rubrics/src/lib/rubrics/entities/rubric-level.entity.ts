import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';               
import { RubricSet } from './rubric-set.entity';       

@Entity('rubric_level')
export class RubricLevel {
    @PrimaryGeneratedColumn()                                                                            
    id: number;                                                                                         
                                                                                                           
    @Column({type: 'varchar', length: 255})                                                            
    description: string;                                                                                
                                                                                                                                         
    @Column({type: 'int'})                                                                             
    rank: number;                       

    // Molti RubricLevel appartengono a UN SOLO RubricSet                                                
    @ManyToOne(() => RubricSet, (rubricSet) => rubricSet.levels, {                                       
        onDelete: 'CASCADE',          
    })  

    @JoinColumn({name: 'rubric_set_id'})   
    rubricSet: RubricSet;                                                                               
                                                                                                                                
    @Column()                                                                                            
    rubric_set_id: number;
}

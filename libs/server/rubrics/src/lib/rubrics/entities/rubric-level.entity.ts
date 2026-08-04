import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';               
import { RubricSetEntity } from './rubric-set.entity';       

@Entity('rubric_levels')
export class RubricLevelEntity {
    @PrimaryGeneratedColumn()                                                                            
    id: number;                                                                                         
                                                                                                           
    @Column({type: 'varchar', length: 255})                                                            
    description: string;                                                                                
                                                                                                                                         
    @Column({type: 'int'})                                                                             
    rank: number;                       

    // Molti RubricLevel appartengono a UN SOLO RubricSet                                                
    @ManyToOne(() => RubricSetEntity, (rubricSet) => rubricSet.levels, {                                       
        onDelete: 'CASCADE',          
    })  

    @JoinColumn({name: 'rubric_set_id'})   
    rubricSet: RubricSetEntity;                                                                               
                                                                                                                                
    @Column()                                                                                            
    rubric_set_id: number;
}

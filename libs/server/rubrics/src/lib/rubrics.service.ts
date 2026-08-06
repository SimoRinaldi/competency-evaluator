import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RubricSetEntity } from './entities/rubric-set.entity';
import { CreateRubricSetDto } from './dto/create-rubric.dto';
import { UpdateRubricSetDto } from './dto/update-rubric.dto';

@Injectable()
export class RubricsService {
    constructor(
        @InjectRepository(RubricSetEntity)
        private readonly rubricSetRepository: Repository<RubricSetEntity>
    ) {}

    async create(createRubricSetDto: CreateRubricSetDto) {                                                                                                                                                                                                                       
        const newSet = this.rubricSetRepository.create(createRubricSetDto);                                                                                                                                                                                                    
        return await this.rubricSetRepository.save(newSet);                                                                                                                      
    } 

    async findAll() {                                                                                                                                                                                                                                                             
        return await this.rubricSetRepository.find({                                                                                                                             
          relations: ['levels'],                                                                                                                                                 
        });                                                                                                                                                                      
    }                                                                                                                                                                          
                                                                                                                                                                                 
    async findOne(id: number) {                                                                                                                                                
        const set = await this.rubricSetRepository.findOne({                                                                                                                     
            where: { id },                                                                                                                                                         
            relations: ['levels'],                                                                                                                                                 
        });                                                                                                                                                                      
        if (!set) {                                                                                                                                                              
            throw new NotFoundException(`RubricSet con ID ${id} non trovato`);                                                                                                     
        }                                                                                                                                                                        
        return set;                                                                                                                                                              
    }   
    
    async update(id: number, updateRubricSetDto: UpdateRubricSetDto) {                                                                                                                                                                                                                                                                       
        const set = await this.rubricSetRepository.preload({                                                                                                 
            id: id,                                                                                                                                            
            ...updateRubricSetDto,                                                                                                                                
        });                                                                                                                                                  
                                                                                                                                                                                                                                        
        if (!set) {                                                                                                                                          
            throw new NotFoundException(`RubricSet con ID ${id} non trovato`);                                                                                 
        }                                                                                                                                                    
                                                                                                                                                                                                                                 
        return await this.rubricSetRepository.save(set);                                                                                                     
    }  
    
    async remove(id: number) {                                                                                                                                                                                                                             
        const result = await this.rubricSetRepository.delete(id);                                                                                            
                                                                                                                                                                                                                                          
        if (result.affected === 0) {                                                                                                                         
          throw new NotFoundException(`RubricSet con ID ${id} non trovato`);                                                                                 
        }                                                                                                                                                    
                                                                                                                                                             
        return { deleted: true };                                                                                                                            
    } 
}

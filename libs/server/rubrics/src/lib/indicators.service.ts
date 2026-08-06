import { Injectable, NotFoundException } from '@nestjs/common';                                                                                          
import { InjectRepository } from '@nestjs/typeorm';                                                                                                      
import { Repository } from 'typeorm';                                                                                                                    
import { IndicatorEntity } from './entities/indicator.entity';                                                                                
import { CreateIndicatorDto } from './dto/create-indicator.dto';

@Injectable()
export class IndicatorsService {
    
    constructor(
        @InjectRepository(IndicatorEntity)
        private readonly indicatorRepository: Repository<IndicatorEntity>,
    ) {}

    async create(createIndicatorDto: CreateIndicatorDto) {                                                                                 
        const newIndicator = this.indicatorRepository.create(createIndicatorDto);                                                               
        return await this.indicatorRepository.save(newIndicator);                                                                                       
    } 

    async findAll() {                                                                                                                                                                                                
        return await this.indicatorRepository.find({                                                                                                 
          relations: ['observationObject', 'rubricSet'],                                                                                                                         
        });                                                                                                                                                  
    }

    async findOne(id: number) {
        const indicator = await this.indicatorRepository.findOne({
            where: {id},
            relations: ['observationObject', 'rubricSet'],
        });

        if (!indicator) {
            throw new NotFoundException('Indicator con ID ${id} non trovato');
        }

        return indicator;
    }
}
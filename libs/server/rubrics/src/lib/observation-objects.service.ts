import { Injectable, NotFoundException } from '@nestjs/common';                                                                                          
import { InjectRepository } from '@nestjs/typeorm';                                                                                                      
import { Repository } from 'typeorm';                                                                                                                    
import { ObservationObjectEntity } from './entities/observation-object.entity';                                                                                
import { CreateObservationObjectDto } from './dto/create-observation-object.dto';
import { UpdateObservationObjectDto } from './dto/update-observation-object.dto';

@Injectable()
export class ObservationObjectsService {
    
    constructor(
        @InjectRepository(ObservationObjectEntity)
        private readonly observationObjectRepository: Repository<ObservationObjectEntity>,
    ) {}

    async create(createObservationObjectDto: CreateObservationObjectDto) {                                                                                 
        const newObject = this.observationObjectRepository.create(createObservationObjectDto);                                                               
        return await this.observationObjectRepository.save(newObject);                                                                                       
    } 

    async findAll() {                                                                                                                                                                                                
        return await this.observationObjectRepository.find({                                                                                                 
          relations: ['indicators'],                                                                                                                         
        });                                                                                                                                                  
    }

    async findOne(id: number) {
        const obj = await this.observationObjectRepository.findOne({
            where: {id},
            relations: ['indicators'],
        });

        if (!obj) {
            throw new NotFoundException('ObservationObject con ID ${id} non trovato');
        }

        return obj;
    }

    async update(id: number, updateIndicatorDto: UpdateObservationObjectDto) {
        await this.observationObjectRepository.update(id, updateIndicatorDto);
        return this.findOne(id);
    }

    async remove(id: number) {
        await this.observationObjectRepository.delete(id);
        return { deleted: true };
    }
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { ObservationObjectRepository } from './observation-object.repository';
import { CreateObservationObjectDto } from './dto/create-observation-object.dto';
import { UpdateObservationObjectDto } from './dto/update-observation-object.dto';
import { ObservationObjectEntity } from './entities/observation-object.entity';

@Injectable()
export class ObservationObjectService {
  constructor(
    private readonly observationObjectRepository: ObservationObjectRepository
  ) {}

  async create(
    createObservationObjectDto: CreateObservationObjectDto
  ): Promise<ObservationObjectEntity> {
    return this.observationObjectRepository.createOne(
      createObservationObjectDto
    );
  }

  async findAll(): Promise<ObservationObjectEntity[]> {
    return this.observationObjectRepository.findAll();
  }

  async findOne(id: number): Promise<ObservationObjectEntity> {
    const obj = await this.observationObjectRepository.findById(id);
    if (!obj) {
      throw new NotFoundException(`ObservationObject con ID ${id} non trovato`);
    }
    return obj;
  }

  async update(
    id: number,
    updateObservationObjectDto: UpdateObservationObjectDto
  ): Promise<ObservationObjectEntity> {
    const obj = await this.observationObjectRepository.updateOne(
      id,
      updateObservationObjectDto
    );
    if (!obj) {
      throw new NotFoundException(`ObservationObject con ID ${id} non trovato`);
    }
    return obj;
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const deleted = await this.observationObjectRepository.deleteOne(id);
    if (!deleted) {
      throw new NotFoundException(`ObservationObject con ID ${id} non trovato`);
    }
    return { deleted: true };
  }
}

export { ObservationObjectService as ObservationObjectsService };

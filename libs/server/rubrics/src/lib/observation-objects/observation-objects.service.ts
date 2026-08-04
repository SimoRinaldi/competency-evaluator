import { Injectable } from '@nestjs/common';
import { CreateObservationObjectDto } from './dto/create-observation-object.dto';
import { UpdateObservationObjectDto } from './dto/update-observation-object.dto';

@Injectable()
export class ObservationObjectsService {
  create(createObservationObjectDto: CreateObservationObjectDto) {
    return 'This action adds a new observationObject';
  }

  findAll() {
    return `This action returns all observationObjects`;
  }

  findOne(id: number) {
    return `This action returns a #${id} observationObject`;
  }

  update(id: number, updateObservationObjectDto: UpdateObservationObjectDto) {
    return `This action updates a #${id} observationObject`;
  }

  remove(id: number) {
    return `This action removes a #${id} observationObject`;
  }
}

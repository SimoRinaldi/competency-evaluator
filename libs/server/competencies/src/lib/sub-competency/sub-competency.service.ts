import { Injectable } from '@nestjs/common';
import { CreateSubCompetencyDto } from './dto/create-sub-competency.dto';
import { UpdateSubCompetencyDto } from './dto/update-sub-competency.dto';

@Injectable()
export class SubCompetencyService {
  create(createSubCompetencyDto: CreateSubCompetencyDto) {
    return 'This action adds a new subCompetency';
  }

  findAll() {
    return `This action returns all subCompetency`;
  }

  findOne(id: number) {
    return `This action returns a #${id} subCompetency`;
  }

  update(id: number, updateSubCompetencyDto: UpdateSubCompetencyDto) {
    return `This action updates a #${id} subCompetency`;
  }

  remove(id: number) {
    return `This action removes a #${id} subCompetency`;
  }
}

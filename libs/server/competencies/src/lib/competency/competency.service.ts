import { Injectable } from '@nestjs/common';
import { CreateCompetencyDto } from './dto/create-competency.dto';
import { UpdateCompetencyDto } from './dto/update-competency.dto';

@Injectable()
export class CompetencyService {
  create(createCompetencyDto: CreateCompetencyDto) {
    return 'This action adds a new competency';
  }

  findAll() {
    return `This action returns all competency`;
  }

  findOne(id: number) {
    return `This action returns a #${id} competency`;
  }

  update(id: number, updateCompetencyDto: UpdateCompetencyDto) {
    return `This action updates a #${id} competency`;
  }

  remove(id: number) {
    return `This action removes a #${id} competency`;
  }
}

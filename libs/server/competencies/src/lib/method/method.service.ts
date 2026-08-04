import { Injectable } from '@nestjs/common';
import { CreateMethodDto } from './dto/create-method.dto';
import { UpdateMethodDto } from './dto/update-method.dto';

@Injectable()
export class MethodService {
  create(createMethodDto: CreateMethodDto) {
    return 'This action adds a new method';
  }

  findAll() {
    return `This action returns all method`;
  }

  findOne(id: number) {
    return `This action returns a #${id} method`;
  }

  update(id: number, updateMethodDto: UpdateMethodDto) {
    return `This action updates a #${id} method`;
  }

  remove(id: number) {
    return `This action removes a #${id} method`;
  }
}

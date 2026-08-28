import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateMethodDto } from './dto/create-method.dto';
import { UpdateMethodDto } from './dto/update-method.dto';
import { MethodEntity } from './entities/method.entity';
import { MethodRepository } from './method.repository';

@Injectable()
export class MethodService {
  constructor(private readonly methodRepository: MethodRepository) {}

  async findOne(id: number): Promise<MethodEntity> {
    const method = await this.methodRepository.findById(id);

    if (!method) throw new NotFoundException(`Method with id ${id} not found`);

    return method;
  }

  async findAll(): Promise<MethodEntity[]> {
    const methods = await this.methodRepository.findAll();

    if (methods && methods.length === 0) {
      throw new NotFoundException(`No methods found.`);
    }
    return methods;
  }

  async create(dto: CreateMethodDto): Promise<MethodEntity> {
    const existing = dto.name
      ? await this.methodRepository.findByName(dto.name)
      : null;

    if (existing) {
      throw new ConflictException('Name already in use');
    }

    return this.methodRepository.createOne(dto);
  }

  async update(id: number, dto: UpdateMethodDto): Promise<MethodEntity> {
    if (dto.name) {
      const existing = await this.methodRepository.findByName(dto.name);
      if (existing && existing.id !== id) {
        throw new ConflictException('Name already in use');
      }
    }

    const updated = await this.methodRepository.updateOne(id, dto);
    if (!updated) {
      throw new NotFoundException(`Method with id ${id} not found`);
    }

    return updated;
  }

  async remove(id: number): Promise<void> {
    const deleted = await this.methodRepository.deleteOne(id);
    if (!deleted) {
      throw new NotFoundException(`Method with id ${id} not found`);
    }
  }
}

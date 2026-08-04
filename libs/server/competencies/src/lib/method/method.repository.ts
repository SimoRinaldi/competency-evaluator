import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MethodEntity } from './entities/method.entity';
import { Repository } from 'typeorm';
import { CreateMethodDto } from './dto/create-method.dto';
import { UpdateMethodDto } from './dto/update-method.dto';

@Injectable()
export class MethodRepository {
  constructor(
    @InjectRepository(MethodEntity)
    private readonly repository: Repository<MethodEntity>
  ) {}

  findById(id: number): Promise<MethodEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  findByName(name: string): Promise<MethodEntity | null> {
    return this.repository.findOne({ where: { name } });
  }

  async createOne(dto: CreateMethodDto): Promise<MethodEntity> {
    const method = this.repository.create({
      name: dto.name,
    });
    return this.repository.save(method);
  }

  findAll(): Promise<MethodEntity[]> {
    return this.repository.find({ order: { id: 'ASC' } });
  }

  async updateOne(id: number, dto: UpdateMethodDto): Promise<MethodEntity | null> {
    const method = await this.findById(id);
    if (!method) {
      return null;
    }
    if (dto.name !== undefined) {
      method.name = dto.name;
    }
    return this.repository.save(method);
  }

  async deleteOne(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

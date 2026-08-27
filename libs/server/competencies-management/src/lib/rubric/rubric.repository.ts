import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RubricSetEntity } from './entities/rubric-set.entity';
import { CreateRubricSetDto } from './dto/create-rubric.dto';
import { UpdateRubricSetDto } from './dto/update-rubric.dto';

@Injectable()
export class RubricRepository {
  constructor(
    @InjectRepository(RubricSetEntity)
    private readonly repository: Repository<RubricSetEntity>
  ) {}

  async createOne(dto: CreateRubricSetDto): Promise<RubricSetEntity> {
    const newSet = this.repository.create(dto);
    return this.repository.save(newSet);
  }

  async findAll(): Promise<RubricSetEntity[]> {
    return this.repository.find({
      order: { id: 'ASC' },
      relations: ['levels'],
    });
  }

  async findById(id: number): Promise<RubricSetEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['levels'],
    });
  }

  async updateOne(
    id: number,
    dto: UpdateRubricSetDto
  ): Promise<RubricSetEntity | null> {
    const set = await this.repository.preload({
      id,
      ...dto,
    });

    if (!set) {
      return null;
    }

    return this.repository.save(set);
  }

  async deleteOne(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

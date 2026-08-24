import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ToolEntity } from './entities/tool.entity';
import { Repository } from 'typeorm';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';

@Injectable()
export class ToolRepository {
  constructor(
    @InjectRepository(ToolEntity)
    private readonly repository: Repository<ToolEntity>
  ) {}

  findById(id: number): Promise<ToolEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  findByName(name: string): Promise<ToolEntity | null> {
    return this.repository.findOne({ where: { name } });
  }

  async createOne(
    dto: CreateToolDto,
  ): Promise<ToolEntity> {
    const tool = this.repository.create({
      name: dto.name,
    });
    return this.repository.save(tool);
  }

  findAll(): Promise<ToolEntity[]> {
    return this.repository.find({ order: { id: 'ASC' } });
  }

  async updateOne(id: number, dto: UpdateToolDto): Promise<ToolEntity | null> {
    const tool = await this.findById(id);
    if (!tool) {
      return null;
    }

    if (dto.name !== undefined) {
      tool.name = dto.name;
    }

    return this.repository.save(tool);
  }

  async deleteOne(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

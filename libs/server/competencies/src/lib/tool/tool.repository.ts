import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tool } from './entities/tool.entity';
import { Repository } from 'typeorm';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';

@Injectable()
export class ToolRepository {
  constructor(
    @InjectRepository(Tool)
    private readonly repository: Repository<Tool>
  ) {}

  findById(id: number): Promise<Tool | null> {
    return this.repository.findOne({ where: { id } });
  }

  findByName(name: string): Promise<Tool | null> {
    return this.repository.findOne({ where: { name } });
  }

  async createOne(
    dto: CreateToolDto,
  ): Promise<Tool> {
    const tool = this.repository.create({
      name: dto.name,
    });
    return this.repository.save(tool);
  }

  findAll(): Promise<Tool[]> {
    return this.repository.find({ order: { id: 'ASC' } });
  }

  async updateOne(id: number, dto: UpdateToolDto): Promise<Tool | null> {
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

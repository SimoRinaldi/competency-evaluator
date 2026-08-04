import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import { Tool } from './entities/tool.entity';
import { ToolRepository } from './tool.repository';

@Injectable()
export class ToolService {
  // Injecting the repository
  constructor(private readonly toolRepository: ToolRepository) {}

  async getOneTool(id: number): Promise<Tool> {
    const tool = await this.toolRepository.findById(id);

    if (!tool) throw new NotFoundException(`Tool with id ${id} not found`);

    return tool;
  }

  async getTools(): Promise<Tool[]> {
    const tools = await this.toolRepository.findAll();

    if (tools && tools.length === 0) {
      throw new NotFoundException(`No tools found.`);
    }
    return tools;
  }

  async create(dto: CreateToolDto): Promise<Tool> {
    const existing = dto.name
      ? await this.toolRepository.findByName(dto.name)
      : null;

    if (existing) {
      throw new ConflictException('Name already in use');
    }

    return this.toolRepository.createOne(dto);
  }

  async update(id: number, dto: UpdateToolDto): Promise<Tool> {
    if (dto.name) {
      const existing = await this.toolRepository.findByName(dto.name);
      if (existing && existing.id !== id) {
        throw new ConflictException('Name already in use');
      }
    }

    const updated = await this.toolRepository.updateOne(id, dto);
    if (!updated) {
      throw new NotFoundException(`Tool with id ${id} not found`);
    }

    return updated;
  }

  async removeTool(id: number): Promise<void> {
    const deleted = await this.toolRepository.deleteOne(id);
    if (!deleted) {
      throw new NotFoundException(`Tool with id ${id} not found`);
    }
  }
}

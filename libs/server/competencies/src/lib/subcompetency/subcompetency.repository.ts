import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SubCompetencyEntity } from './entities/subcompetency.entity';
import { Repository } from 'typeorm';
import { CreateSubCompetencyDto } from './dto/create-subcompetency.dto';
import { UpdateSubCompetencyDto } from './dto/update-subcompetency.dto';
import { ToolEntity } from '../tool/entities/tool.entity';
import { MethodEntity } from '../method/entities/method.entity';
import { SkillEntity } from '../skill/entities/skill.entity';

@Injectable()
export class SubCompetencyRepository {
  constructor(
    @InjectRepository(SubCompetencyEntity)
    private readonly repository: Repository<SubCompetencyEntity>
  ) {}

  findById(id: number): Promise<SubCompetencyEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['competency', 'tools', 'methods', 'skills'],
    });
  }

  findByTitle(title: string): Promise<SubCompetencyEntity | null> {
    return this.repository.findOne({ where: { title } });
  }

  async createOne(dto: CreateSubCompetencyDto): Promise<SubCompetencyEntity> {
    const subCompetency = this.repository.create({
      title: dto.title,
      weight: dto.weight,
      input: dto.input,
      output: dto.output,
      action: dto.action,
      competency_id: dto.competency_id,
      tools: dto.tool_ids ? dto.tool_ids.map((id) => ({ id } as ToolEntity)) : undefined,
      methods: dto.method_ids ? dto.method_ids.map((id) => ({ id } as MethodEntity)) : undefined,
      skills: dto.skill_ids ? dto.skill_ids.map((id) => ({ id } as SkillEntity)) : undefined,
    });
    return this.repository.save(subCompetency);
  }

  findAll(): Promise<SubCompetencyEntity[]> {
    return this.repository.find({
      order: { id: 'ASC' },
      relations: ['competency', 'tools', 'methods', 'skills'],
    });
  }

  async updateOne(
    id: number,
    dto: UpdateSubCompetencyDto
  ): Promise<SubCompetencyEntity | null> {
    const subCompetency = await this.findById(id);
    if (!subCompetency) {
      return null;
    }
    const { tool_ids, method_ids, skill_ids, ...rest } = dto;
    Object.assign(subCompetency, rest);

    if (tool_ids !== undefined) {
      subCompetency.tools = tool_ids.map((id) => ({ id } as ToolEntity));
    }
    if (method_ids !== undefined) {
      subCompetency.methods = method_ids.map((id) => ({ id } as MethodEntity));
    }
    if (skill_ids !== undefined) {
      subCompetency.skills = skill_ids.map((id) => ({ id } as SkillEntity));
    }

    return this.repository.save(subCompetency);
  }

  async deleteOne(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

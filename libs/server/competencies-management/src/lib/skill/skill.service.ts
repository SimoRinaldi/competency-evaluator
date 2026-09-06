import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { SkillEntity } from './entities/skill.entity';
import { SkillRepository } from './skill.repository';

@Injectable()
export class SkillService {
  constructor(private readonly skillRepository: SkillRepository) {}

  async findOne(id: number): Promise<SkillEntity> {
    const skill = await this.skillRepository.findById(id);

    if (!skill) throw new NotFoundException(`Skill with id ${id} not found`);

    return skill;
  }

  async findAll(): Promise<SkillEntity[]> {
    const skills = await this.skillRepository.findAll();

    return skills || [];
  }

  async create(dto: CreateSkillDto): Promise<SkillEntity> {
    const existing = dto.name
      ? await this.skillRepository.findByName(dto.name)
      : null;

    if (existing) {
      throw new ConflictException('Name already in use');
    }

    return this.skillRepository.createOne(dto);
  }

  async update(id: number, dto: UpdateSkillDto): Promise<SkillEntity> {
    if (dto.name) {
      const existing = await this.skillRepository.findByName(dto.name);
      if (existing && existing.id !== id) {
        throw new ConflictException('Name already in use');
      }
    }

    const updated = await this.skillRepository.updateOne(id, dto);
    if (!updated) {
      throw new NotFoundException(`Skill with id ${id} not found`);
    }

    return updated;
  }

  async remove(id: number): Promise<void> {
    const deleted = await this.skillRepository.deleteOne(id);
    if (!deleted) {
      throw new NotFoundException(`Skill with id ${id} not found`);
    }
  }
}

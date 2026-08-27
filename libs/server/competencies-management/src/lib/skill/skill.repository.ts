import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SkillEntity } from './entities/skill.entity';
import { Repository } from 'typeorm';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Injectable()
export class SkillRepository {
  constructor(
    @InjectRepository(SkillEntity)
    private readonly repository: Repository<SkillEntity>
  ) {}

  findById(id: number): Promise<SkillEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  findByName(name: string): Promise<SkillEntity | null> {
    return this.repository.findOne({ where: { name } });
  }

  async createOne(dto: CreateSkillDto): Promise<SkillEntity> {
    const skill = this.repository.create({
      name: dto.name,
    });
    return this.repository.save(skill);
  }

  findAll(): Promise<SkillEntity[]> {
    return this.repository.find({ order: { id: 'ASC' } });
  }

  async updateOne(id: number, dto: UpdateSkillDto): Promise<SkillEntity | null> {
    const skill = await this.findById(id);
    if (!skill) {
      return null;
    }
    if (dto.name !== undefined) {
      skill.name = dto.name;
    }
    return this.repository.save(skill);
  }

  async deleteOne(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

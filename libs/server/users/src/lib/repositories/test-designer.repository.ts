import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestDesignerEntity } from '../entities/test-designer.entity';

@Injectable()
export class TestDesignersRepository {
  constructor(
    @InjectRepository(TestDesignerEntity)
    private readonly repository: Repository<TestDesignerEntity>
  ) {}

  async createOne(user_id: number): Promise<TestDesignerEntity> {
    const testDesigner = this.repository.create({ user_id });
    return this.repository.save(testDesigner);
  }

  async findAll(): Promise<TestDesignerEntity[]> {
    return this.repository.find({
      order: { id: 'ASC' },
      relations: ['user'],
    });
  }

  async findById(id: number): Promise<TestDesignerEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findByUserId(user_id: number): Promise<TestDesignerEntity | null> {
    return this.repository.findOne({
      where: { user_id },
      relations: ['user'],
    });
  }

  async deleteOne(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async deleteByUserId(user_id: number): Promise<boolean> {
    const result = await this.repository.delete({ user_id });
    return (result.affected ?? 0) > 0;
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestDesignerEntity } from './entities/test-designer.entity';
import { CreateTestDesignerDto } from './dto/create-test-designer.dto';
import { UpdateTestDesignerDto } from './dto/update-test-designer.dto';

@Injectable()
export class TestDesignerRepository {
  constructor(
    @InjectRepository(TestDesignerEntity)
    private readonly repository: Repository<TestDesignerEntity>
  ) {}

  async createOne(dto: CreateTestDesignerDto): Promise<TestDesignerEntity> {
    const designer = this.repository.create({ user_id: dto.user_id });
    return this.repository.save(designer);
  }

  async findAll(): Promise<TestDesignerEntity[]> {
    return this.repository.find({
      relations: ['user', 'tests'],
    });
  }

  async findById(id: number): Promise<TestDesignerEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['user', 'tests'],
    });
  }

  async findByUserId(user_id: number): Promise<TestDesignerEntity | null> {
    return this.repository.findOne({
      where: { user_id },
      relations: ['user', 'tests'],
    });
  }

  async updateOne(
    designer: TestDesignerEntity,
    dto: UpdateTestDesignerDto
  ): Promise<TestDesignerEntity> {
    if (dto.user_id !== undefined) designer.user_id = dto.user_id;
    return this.repository.save(designer);
  }

  async deleteOne(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

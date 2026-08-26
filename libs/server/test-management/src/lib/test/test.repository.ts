import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubCompetencyEntity } from '@server/competencies';
import { TestEntity } from './entities/test.entity';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';

@Injectable()
export class TestRepository {
  constructor(
    @InjectRepository(TestEntity)
    private readonly repository: Repository<TestEntity>
  ) {}

  async createOne(dto: CreateTestDto): Promise<TestEntity> {
    const test = this.repository.create({
      assessment_situation: dto.assessment_situation,
      test_designer_id: dto.test_designer_id,
      subcompetencies: dto.subcompetency_ids
        ? dto.subcompetency_ids.map((id) => ({ id } as SubCompetencyEntity))
        : undefined,
    });

    return this.repository.save(test);
  }

  async findAll(): Promise<TestEntity[]> {
    return this.repository.find({
      order: { id: 'ASC' },
      relations: ['test_designer', 'test_executions', 'subcompetencies'],
    });
  }

  async findById(id: number): Promise<TestEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['test_designer', 'test_executions', 'subcompetencies'],
    });
  }

  async findByTestDesignerId(test_designer_id: number): Promise<TestEntity[]> {
    return this.repository.find({
      where: { test_designer_id },
      order: { id: 'ASC' },
      relations: ['test_designer', 'test_executions', 'subcompetencies'],
    });
  }

  async updateOne(test: TestEntity, dto: UpdateTestDto): Promise<TestEntity> {
    if (dto.assessment_situation !== undefined)
      test.assessment_situation = dto.assessment_situation;
    if (dto.test_designer_id !== undefined)
      test.test_designer_id = dto.test_designer_id;
    if (dto.subcompetency_ids !== undefined)
      test.subcompetencies = dto.subcompetency_ids.map(
        (id) => ({ id } as SubCompetencyEntity)
      );

    return this.repository.save(test);
  }

  async deleteOne(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

export { TestRepository as ServerTestsRepository };

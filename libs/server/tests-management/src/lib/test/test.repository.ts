import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubCompetencyEntity } from '@server/competencies-management';
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
    const query = this.repository.createQueryBuilder('test')
      .leftJoinAndSelect('test.test_designer', 'test_designer')
      .leftJoinAndSelect('test_designer.user', 'user')
      .leftJoinAndSelect('test.subcompetencies', 'subcompetencies')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(*)', 'count')
          .from('test_execution', 'te')
          .where('te.test_id = test.id');
      }, 'executions_count')
      .orderBy('test.id', 'ASC');

    const rawAndEntities = await query.getRawAndEntities();
    return rawAndEntities.entities.map((entity, index) => {
      entity.executions_count = parseInt(rawAndEntities.raw[index].executions_count || '0', 10);
      return entity;
    });
  }

  async findById(id: number): Promise<TestEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['test_designer', 'subcompetencies'],
    });
  }

  async findByTestDesignerId(test_designer_id: number): Promise<TestEntity[]> {
    return this.repository.find({
      where: { test_designer_id },
      order: { id: 'ASC' },
      relations: ['test_designer', 'subcompetencies'],
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

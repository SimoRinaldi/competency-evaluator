import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestOutputEntity } from './entities/test-output.entity';
import { CreateTestOutputDto } from './dto/create-test-output.dto';
import { UpdateTestOutputDto } from './dto/update-test-output.dto';

@Injectable()
export class TestOutputRepository {
  constructor(
    @InjectRepository(TestOutputEntity)
    private readonly repository: Repository<TestOutputEntity>,
  ) {}

  async createOne(dto: CreateTestOutputDto): Promise<TestOutputEntity> {
    const testOutput = this.repository.create({
      name: dto.name,
      description: dto.description,
      url: dto.url,
      test_execution_id: dto.test_execution_id,
      version: dto.version,
    });

    return this.repository.save(testOutput);
  }

  async findAll(): Promise<TestOutputEntity[]> {
    return this.repository.find({
      order: { id: 'ASC' },
      relations: ['test_execution'],
    });
  }

  async findById(id: number): Promise<TestOutputEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['test_execution'],
    });
  }

  async findByTestExecutionId(test_execution_id: number): Promise<TestOutputEntity[]> {
    return this.repository.find({
      where: { test_execution_id },
      order: { id: 'ASC' },
      relations: ['test_execution'],
    });
  }

  async updateOne(
    testOutput: TestOutputEntity,
    dto: UpdateTestOutputDto,
  ): Promise<TestOutputEntity> {
    if (dto.name !== undefined) testOutput.name = dto.name;
    if (dto.description !== undefined) testOutput.description = dto.description;
    if (dto.url !== undefined) testOutput.url = dto.url;
    if (dto.test_execution_id !== undefined) testOutput.test_execution_id = dto.test_execution_id;
    if (dto.version !== undefined) testOutput.version = dto.version;

    return this.repository.save(testOutput);
  }

  async deleteOne(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

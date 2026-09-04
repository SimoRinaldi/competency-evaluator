import { Injectable, NotFoundException } from '@nestjs/common';
import { TestOutputEntity } from './entities/test-output.entity';
import { CreateTestOutputDto } from './dto/create-test-output.dto';
import { UpdateTestOutputDto } from './dto/update-test-output.dto';
import { TestOutputRepository } from './test-output.repository';
import { TestExecutionRepository } from '../test-execution/test-execution.repository';

@Injectable()
export class TestOutputService {
  constructor(
    private readonly testOutputsRepository: TestOutputRepository,
    private readonly testExecutionsRepository: TestExecutionRepository,
  ) {}

  async create(dto: CreateTestOutputDto): Promise<TestOutputEntity> {
    const test_execution = await this.testExecutionsRepository.findById(dto.test_execution_id);
    if (!test_execution) {
      throw new NotFoundException(`Test execution con ID ${dto.test_execution_id} non trovata.`);
    }

    return this.testOutputsRepository.createOne(dto);
  }

  async findAll(): Promise<TestOutputEntity[]> {
    return this.testOutputsRepository.findAll();
  }

  async findOne(id: number): Promise<TestOutputEntity> {
    const test_output = await this.testOutputsRepository.findById(id);

    if (!test_output) {
      throw new NotFoundException(`Test output con ID ${id} non trovato.`);
    }

    return test_output;
  }

  async findByTestExecution(test_execution_id: number): Promise<TestOutputEntity[]> {
    const test_execution = await this.testExecutionsRepository.findById(test_execution_id);
    if (!test_execution) {
      throw new NotFoundException(`Test execution con ID ${test_execution_id} non trovata.`);
    }

    return this.testOutputsRepository.findByTestExecutionId(test_execution_id);
  }

  async update(id: number, dto: UpdateTestOutputDto): Promise<TestOutputEntity> {
    const test_output = await this.testOutputsRepository.findById(id);
    if (!test_output) {
      throw new NotFoundException(`Test output con ID ${id} non trovato.`);
    }

    if (
      dto.test_execution_id !== undefined &&
      dto.test_execution_id !== test_output.test_execution_id
    ) {
      const test_execution = await this.testExecutionsRepository.findById(dto.test_execution_id);
      if (!test_execution) {
        throw new NotFoundException(`Test execution con ID ${dto.test_execution_id} non trovata.`);
      }
    }

    return this.testOutputsRepository.updateOne(test_output, dto);
  }

  async remove(id: number): Promise<void> {
    const test_output = await this.testOutputsRepository.findById(id);
    if (!test_output) {
      throw new NotFoundException(`Test output con ID ${id} non trovato.`);
    }

    const is_deleted = await this.testOutputsRepository.deleteOne(id);
    if (!is_deleted) {
      throw new NotFoundException(
        `Errore durante l'eliminazione. Il test output con ID ${id} potrebbe essere gi├á stato rimosso.`,
      );
    }
  }
}

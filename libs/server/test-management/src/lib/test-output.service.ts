import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TestOutputEntity } from './entities/test-output.entity';
import { CreateTestOutputDto } from './dto/create-test-output.dto';
import { UpdateTestOutputDto } from './dto/update-test-output.dto';
import { ServerTestOutputsRepository } from './test-output.repository';
import { ServerTestExecutionsRepository } from './test-execution.repository';

@Injectable()
export class ServerTestOutputsService {
  constructor(
    private readonly testOutputsRepository: ServerTestOutputsRepository,
    private readonly testExecutionsRepository: ServerTestExecutionsRepository
  ) {}

  async create(dto: CreateTestOutputDto): Promise<TestOutputEntity> {
    const execution = await this.testExecutionsRepository.findById(
      dto.test_execution_id
    );
    if (!execution) {
      throw new NotFoundException(
        `Test execution con ID ${dto.test_execution_id} non trovata.`
      );
    }

    return this.testOutputsRepository.createOne(dto);
  }

  async findAll(): Promise<TestOutputEntity[]> {
    return this.testOutputsRepository.findAll();
  }

  async findOne(id: number): Promise<TestOutputEntity> {
    const testOutput = await this.testOutputsRepository.findById(id);

    if (!testOutput) {
      throw new NotFoundException(`Test output con ID ${id} non trovato.`);
    }

    return testOutput;
  }

  async findByTestExecution(testExecutionId: number): Promise<TestOutputEntity[]> {
    const execution = await this.testExecutionsRepository.findById(
      testExecutionId
    );
    if (!execution) {
      throw new NotFoundException(
        `Test execution con ID ${testExecutionId} non trovata.`
      );
    }

    return this.testOutputsRepository.findByTestExecutionId(testExecutionId);
  }

  async update(
    id: number,
    dto: UpdateTestOutputDto
  ): Promise<TestOutputEntity> {
    const testOutput = await this.testOutputsRepository.findById(id);
    if (!testOutput) {
      throw new NotFoundException(`Test output con ID ${id} non trovato.`);
    }

    if (
      dto.test_execution_id !== undefined &&
      dto.test_execution_id !== testOutput.test_execution_id
    ) {
      const execution = await this.testExecutionsRepository.findById(
        dto.test_execution_id
      );
      if (!execution) {
        throw new NotFoundException(
          `Test execution con ID ${dto.test_execution_id} non trovata.`
        );
      }
    }

    return this.testOutputsRepository.updateOne(testOutput, dto);
  }

  async remove(id: number): Promise<void> {
    const testOutput = await this.testOutputsRepository.findById(id);
    if (!testOutput) {
      throw new NotFoundException(`Test output con ID ${id} non trovato.`);
    }

    const isDeleted = await this.testOutputsRepository.deleteOne(id);
    if (!isDeleted) {
      throw new NotFoundException(
        `Errore durante l'eliminazione. Il test output con ID ${id} potrebbe essere già stato rimosso.`
      );
    }
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { EvaluatedUsersRepository } from '@server/users';
import { TestRepository } from '@server/test-management';
import { TestExecutionEntity } from './entities/test-execution.entity';
import { CreateTestExecutionDto } from './dto/create-test-execution.dto';
import { UpdateTestExecutionDto } from './dto/update-test-execution.dto';
import { TestExecutionRepository } from './test-execution.repository';

@Injectable()
export class TestExecutionService {
  constructor(
    private readonly testExecutionsRepository: TestExecutionRepository,
    private readonly testsRepository: TestRepository,
    private readonly evaluatedUsersRepository: EvaluatedUsersRepository
  ) {}

  async create(dto: CreateTestExecutionDto): Promise<TestExecutionEntity> {
    const test = await this.testsRepository.findById(dto.test_id);
    if (!test) {
      throw new NotFoundException(`Test con ID ${dto.test_id} non trovato.`);
    }

    const evaluatedUser = await this.evaluatedUsersRepository.findById(
      dto.user_id
    );
    if (!evaluatedUser) {
      throw new NotFoundException(
        `Evaluated user con ID ${dto.user_id} non trovato.`
      );
    }

    return this.testExecutionsRepository.createOne(dto);
  }

  async findAll(): Promise<TestExecutionEntity[]> {
    return this.testExecutionsRepository.findAll();
  }

  async findOne(id: number): Promise<TestExecutionEntity> {
    const testExecution = await this.testExecutionsRepository.findById(id);

    if (!testExecution) {
      throw new NotFoundException(`Test execution con ID ${id} non trovata.`);
    }

    return testExecution;
  }

  async findByEvaluatedUser(userId: number): Promise<TestExecutionEntity[]> {
    const evaluatedUser = await this.evaluatedUsersRepository.findById(userId);
    if (!evaluatedUser) {
      throw new NotFoundException(
        `Evaluated user con ID ${userId} non trovato.`
      );
    }

    return this.testExecutionsRepository.findByEvaluatedUserId(userId);
  }

  async findByTest(testId: number): Promise<TestExecutionEntity[]> {
    const test = await this.testsRepository.findById(testId);
    if (!test) {
      throw new NotFoundException(`Test con ID ${testId} non trovato.`);
    }

    return this.testExecutionsRepository.findByTestId(testId);
  }

  async update(
    id: number,
    dto: UpdateTestExecutionDto
  ): Promise<TestExecutionEntity> {
    const testExecution = await this.testExecutionsRepository.findById(id);
    if (!testExecution) {
      throw new NotFoundException(`Test execution con ID ${id} non trovata.`);
    }

    if (dto.test_id !== undefined && dto.test_id !== testExecution.test_id) {
      const test = await this.testsRepository.findById(dto.test_id);
      if (!test) {
        throw new NotFoundException(`Test con ID ${dto.test_id} non trovato.`);
      }
    }

    if (dto.user_id !== undefined && dto.user_id !== testExecution.user_id) {
      const evaluatedUser = await this.evaluatedUsersRepository.findById(
        dto.user_id
      );
      if (!evaluatedUser) {
        throw new NotFoundException(
          `Evaluated user con ID ${dto.user_id} non trovato.`
        );
      }
    }

    return this.testExecutionsRepository.updateOne(testExecution, dto);
  }

  async remove(id: number): Promise<void> {
    const testExecution = await this.testExecutionsRepository.findById(id);
    if (!testExecution) {
      throw new NotFoundException(`Test execution con ID ${id} non trovata.`);
    }

    const isDeleted = await this.testExecutionsRepository.deleteOne(id);
    if (!isDeleted) {
      throw new NotFoundException(
        `Errore durante l'eliminazione. La test execution con ID ${id} potrebbe essere già stata rimossa.`
      );
    }
  }
}

export { TestExecutionService as ServerTestExecutionsService };

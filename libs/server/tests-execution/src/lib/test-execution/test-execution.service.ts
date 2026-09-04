import { Injectable, NotFoundException } from '@nestjs/common';
import { EvaluatedUserRepository } from '../evaluated-user/evaluated-user.repository';
import { TestRepository } from '@server/tests-management';
import { TestExecutionEntity } from './entities/test-execution.entity';
import { CreateTestExecutionDto } from './dto/create-test-execution.dto';
import { UpdateTestExecutionDto } from './dto/update-test-execution.dto';
import { TestExecutionRepository } from './test-execution.repository';

@Injectable()
export class TestExecutionService {
  constructor(
    private readonly testExecutionsRepository: TestExecutionRepository,
    private readonly testsRepository: TestRepository,
    private readonly evaluatedUsersRepository: EvaluatedUserRepository,
  ) {}

  async create(dto: CreateTestExecutionDto): Promise<TestExecutionEntity> {
    const test = await this.testsRepository.findById(dto.test_id);
    if (!test) throw new NotFoundException(`Test con ID ${dto.test_id} non trovato.`);

    let evaluated_user = await this.evaluatedUsersRepository.findByUserId(dto.user_id);
    if (!evaluated_user) {
      // crea l'EvaluatedUser se non esiste
      evaluated_user = await this.evaluatedUsersRepository.createOne({ user_id: dto.user_id });
    }

    const real_dto = { ...dto, user_id: evaluated_user.id };
    return this.testExecutionsRepository.createOne(real_dto);
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
    const evaluatedUser = await this.evaluatedUsersRepository.findByUserId(userId);
    if (!evaluatedUser) {
      return [];
    }

    return this.testExecutionsRepository.findByEvaluatedUserId(evaluatedUser.id);
  }

  async findByTest(testId: number): Promise<TestExecutionEntity[]> {
    const test = await this.testsRepository.findById(testId);
    if (!test) {
      throw new NotFoundException(`Test con ID ${testId} non trovato.`);
    }

    return this.testExecutionsRepository.findByTestId(testId);
  }

  async update(id: number, dto: UpdateTestExecutionDto): Promise<TestExecutionEntity> {
    const test_execution = await this.testExecutionsRepository.findById(id);
    if (!test_execution) throw new NotFoundException(`Test execution con ID ${id} non trovata.`);

    if (dto.test_id !== undefined && dto.test_id !== test_execution.test_id) {
      const test = await this.testsRepository.findById(dto.test_id);
      if (!test) throw new NotFoundException(`Test con ID ${dto.test_id} non trovato.`);
    }

    if (dto.user_id !== undefined && dto.user_id !== test_execution.user_id) {
      const evaluated_user = await this.evaluatedUsersRepository.findById(dto.user_id);
      if (!evaluated_user)
        throw new NotFoundException(`Evaluated user con ID ${dto.user_id} non trovato.`);
    }

    return this.testExecutionsRepository.updateOne(test_execution, dto);
  }

  async remove(id: number): Promise<void> {
    const test_execution = await this.testExecutionsRepository.findById(id);
    if (!test_execution) {
      throw new NotFoundException(`Test execution con ID ${id} non trovata.`);
    }

    const is_deleted = await this.testExecutionsRepository.deleteOne(id);
    if (!is_deleted) {
      throw new NotFoundException(
        `Errore durante l'eliminazione. La test execution con ID ${id} potrebbe essere già stata rimossa.`,
      );
    }
  }
}

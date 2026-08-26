import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TestEvaluatorRepository } from './test-evaluator.repository';
import { CreateTestEvaluatorDto } from './dto/create-test-evaluator.dto';
import { UpdateTestEvaluatorDto } from './dto/update-test-evaluator.dto';
import { TestEvaluatorEntity } from './entities/test-evaluator.entity';
import { ServerUsersService } from '@server/users';

@Injectable()
export class TestEvaluatorService {
  constructor(
    private readonly repository: TestEvaluatorRepository,
    private readonly usersService: ServerUsersService
  ) {}

  async create(dto: CreateTestEvaluatorDto): Promise<TestEvaluatorEntity> {
    await this.usersService.getOneUser(dto.user_id);

    const existing = await this.repository.findByUserId(dto.user_id);
    if (existing) {
      throw new ConflictException(
        `L'utente con ID ${dto.user_id} è già registrato come Test Evaluator.`
      );
    }

    return this.repository.createOne(dto);
  }

  async findAll(): Promise<TestEvaluatorEntity[]> {
    return this.repository.findAll();
  }

  async findOne(id: number): Promise<TestEvaluatorEntity> {
    const evaluator = await this.repository.findById(id);
    if (!evaluator) {
      throw new NotFoundException(`Test Evaluator con ID ${id} non trovato.`);
    }
    return evaluator;
  }

  async findByUserId(userId: number): Promise<TestEvaluatorEntity | null> {
    return this.repository.findByUserId(userId);
  }

  async update(
    id: number,
    dto: UpdateTestEvaluatorDto
  ): Promise<TestEvaluatorEntity> {
    const evaluator = await this.repository.findById(id);
    if (!evaluator) {
      throw new NotFoundException(`Test Evaluator con ID ${id} non trovato.`);
    }

    if (dto.user_id !== undefined && dto.user_id !== evaluator.user_id) {
      await this.usersService.getOneUser(dto.user_id);
      const existing = await this.repository.findByUserId(dto.user_id);
      if (existing) {
        throw new ConflictException(
          `L'utente con ID ${dto.user_id} è già registrato come Test Evaluator.`
        );
      }
    }

    return this.repository.updateOne(evaluator, dto);
  }

  async remove(id: number): Promise<void> {
    const evaluator = await this.repository.findById(id);
    if (!evaluator) {
      throw new NotFoundException(`Test Evaluator con ID ${id} non trovato.`);
    }

    const isDeleted = await this.repository.deleteOne(id);
    if (!isDeleted) {
      throw new NotFoundException(
        `Errore durante l'eliminazione del Test Evaluator con ID ${id}.`
      );
    }
  }
}

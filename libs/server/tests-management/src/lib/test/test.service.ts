import { Injectable, NotFoundException, InternalServerErrorException, HttpException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TestDesignerRepository } from '../test-designer/test-designer.repository';
import { TestEntity } from './entities/test.entity';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { TestRepository } from './test.repository';
import { SubCompetencyEntity } from '@server/competencies-management';

@Injectable()
export class TestService {
  constructor(
    private readonly testsRepository: TestRepository,
    private readonly testDesignerRepository: TestDesignerRepository,
    private readonly dataSource: DataSource
  ) {}

  async create(dto: CreateTestDto): Promise<TestEntity> {
    const designer = await this.testDesignerRepository.findById(
      dto.test_designer_id
    );
    if (!designer) {
      throw new NotFoundException(
        `Test designer con ID ${dto.test_designer_id} non trovato.`
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      // 1. Creazione e salvataggio dell'entità Test con le relative sotto-competenze
      const test = manager.create(TestEntity, {
        assessment_situation: dto.assessment_situation,
        test_designer_id: dto.test_designer_id,
        subcompetencies: dto.subcompetency_ids.map((id) => ({ id } as SubCompetencyEntity))
      });
      const savedTest = await manager.save(test);

      // 2. Collegamento valutatori nella tabella N:N test_evaluation
      if (dto.evaluator_ids && dto.evaluator_ids.length > 0) {
        const evaluatorRows = dto.evaluator_ids.map((evaluatorId) => ({
          test_id: savedTest.id,
          test_evaluator_id: evaluatorId,
        }));

        await manager
          .createQueryBuilder()
          .insert()
          .into('test_evaluation')
          .values(evaluatorRows)
          .execute();
      }

      // 3. Creazione record test_execution per ciascun evaluated_user assegnato
      if (dto.evaluated_user_ids && dto.evaluated_user_ids.length > 0) {
        const executionRows = dto.evaluated_user_ids.map((userId) => ({
          test_id: savedTest.id,
          user_id: userId,
          test_score: null,
          max_score: null,
        }));

        await manager
          .createQueryBuilder()
          .insert()
          .into('test_execution')
          .values(executionRows)
          .execute();
      }

      await queryRunner.commitTransaction();
      return savedTest;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Errore durante la creazione del test: ${(error as Error).message || 'Operazione annullata.'}`
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<TestEntity[]> {
    return this.testsRepository.findAll();
  }

  async findOne(id: number): Promise<TestEntity> {
    const test = await this.testsRepository.findById(id);

    if (!test) {
      throw new NotFoundException(`Test con ID ${id} non trovato.`);
    }

    return test;
  }

  async findByTestDesigner(designerId: number): Promise<TestEntity[]> {
    const designer = await this.testDesignerRepository.findById(designerId);
    if (!designer) {
      throw new NotFoundException(
        `Test designer con ID ${designerId} non trovato.`
      );
    }

    return this.testsRepository.findByTestDesignerId(designerId);
  }

  async update(id: number, dto: UpdateTestDto): Promise<TestEntity> {
    const test = await this.testsRepository.findById(id);
    if (!test) {
      throw new NotFoundException(`Test con ID ${id} non trovato.`);
    }

    if (
      dto.test_designer_id !== undefined &&
      dto.test_designer_id !== test.test_designer_id
    ) {
      const designer = await this.testDesignerRepository.findById(
        dto.test_designer_id
      );
      if (!designer) {
        throw new NotFoundException(
          `Test designer con ID ${dto.test_designer_id} non trovato.`
        );
      }
    }

    return this.testsRepository.updateOne(test, dto);
  }

  async remove(id: number): Promise<void> {
    const test = await this.testsRepository.findById(id);
    if (!test) {
      throw new NotFoundException(`Test con ID ${id} non trovato.`);
    }

    const isDeleted = await this.testsRepository.deleteOne(id);
    if (!isDeleted) {
      throw new NotFoundException(
        `Errore durante l'eliminazione. Il test con ID ${id} potrebbe essere già stato rimosso.`
      );
    }
  }
}

export {
  TestService as ServerTestsManagementService,
  TestService as ServerTestManagementService,
  TestService as ServerTestsService,
};

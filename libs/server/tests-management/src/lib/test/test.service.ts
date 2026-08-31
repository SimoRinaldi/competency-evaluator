import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { DataSource, In } from 'typeorm';
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

    if (!dto.subcompetency_ids || dto.subcompetency_ids.length === 0) {
      throw new BadRequestException(
        'Il test deve contenere almeno una sotto-competenza.'
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      // 0. Verifica che tutte le sotto-competenze esistano e appartengano alla STESSA competenza
      const subcompetencies = await manager.find(SubCompetencyEntity, {
        where: { id: In(dto.subcompetency_ids) },
      });

      if (subcompetencies.length !== dto.subcompetency_ids.length) {
        const foundIds = new Set(subcompetencies.map((s) => s.id));
        const missingIds = dto.subcompetency_ids.filter((id) => !foundIds.has(id));
        throw new NotFoundException(
          `Sotto-competenze non trovate per gli ID: ${missingIds.join(', ')}`
        );
      }

      const uniqueCompetencyIds = new Set(
        subcompetencies.map((s) => s.competency_id)
      );

      if (uniqueCompetencyIds.size > 1) {
        throw new BadRequestException(
          'Tutte le sotto-competenze selezionate per il test devono appartenere alla medesima competenza.'
        );
      }

      // 1. Creazione e salvataggio dell'entità Test
      const test = manager.create(TestEntity, {
        assessment_situation: dto.assessment_situation,
        test_designer_id: dto.test_designer_id,
      });
      const savedTest = await manager.save(test);

      // 1.5. Collegamento sottocompetenze nella tabella pivot
      if (dto.subcompetency_ids && dto.subcompetency_ids.length > 0) {
        const subRows = dto.subcompetency_ids.map((subId) => ({
          test_id: savedTest.id,
          subcompetency_id: subId,
        }));
        await manager.insert('test_subcompetency', subRows);
      }

      // 2. Collegamento valutatori nella tabella N:N test_evaluation
      if (dto.evaluator_ids && dto.evaluator_ids.length > 0) {
        const evaluatorRows = dto.evaluator_ids.map((evaluatorId) => ({
          test_id: savedTest.id,
          test_evaluator_id: evaluatorId,
        }));

        await manager.insert('test_evaluation', evaluatorRows);
      }

      // 3. Creazione record test_execution per ciascun evaluated_user assegnato
      if (dto.evaluated_user_ids && dto.evaluated_user_ids.length > 0) {
        const executionRows = dto.evaluated_user_ids.map((userId) => ({
          test_id: savedTest.id,
          user_id: userId,
          test_score: null,
          max_score: null,
        }));

        await manager.insert('test_execution', executionRows);
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

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      if (dto.assessment_situation !== undefined) test.assessment_situation = dto.assessment_situation;
      if (dto.test_designer_id !== undefined) test.test_designer_id = dto.test_designer_id;
      
      const savedTest = await manager.save(test);

      if (dto.subcompetency_ids !== undefined) {
        await manager.delete('test_subcompetency', { test_id: id });
        if (dto.subcompetency_ids.length > 0) {
          const subRows = dto.subcompetency_ids.map((subId) => ({
            test_id: id,
            subcompetency_id: subId,
          }));
          await manager.insert('test_subcompetency', subRows);
        }
      }

      if (dto.evaluator_ids !== undefined) {
        await manager.delete('test_evaluation', { test_id: id });
        if (dto.evaluator_ids.length > 0) {
          const evaluatorRows = dto.evaluator_ids.map((evaluatorId) => ({
            test_id: id,
            test_evaluator_id: evaluatorId,
          }));
          await manager.insert('test_evaluation', evaluatorRows);
        }
      }

      if (dto.evaluated_user_ids !== undefined) {
        await manager.delete('test_execution', { test_id: id });
        if (dto.evaluated_user_ids.length > 0) {
          const executionRows = dto.evaluated_user_ids.map((userId) => ({
            test_id: id,
            user_id: userId,
            test_score: null,
            max_score: null,
          }));
          await manager.insert('test_execution', executionRows);
        }
      }

      await queryRunner.commitTransaction();
      return savedTest;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        `Errore durante l'aggiornamento del test: ${(error as Error).message}`
      );
    } finally {
      await queryRunner.release();
    }
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

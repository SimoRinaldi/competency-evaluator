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
import { EvaluatedUserService } from '@server/tests-evaluation';

@Injectable()
export class TestService {
  constructor(
    private readonly testsRepository: TestRepository,
    private readonly testDesignerRepository: TestDesignerRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateTestDto): Promise<TestEntity> {
    const designer = await this.testDesignerRepository.findById(dto.test_designer_id);
    if (!designer) {
      throw new NotFoundException(`Test designer con ID ${dto.test_designer_id} non trovato.`);
    }

    if (!dto.subcompetency_ids || dto.subcompetency_ids.length === 0) {
      throw new BadRequestException('Il test deve contenere almeno una sotto-competenza.');
    }

    // QueryRunner per eseguire una transazione:
    // annulla tutte le modifiche precedenti se una operazione di inserimento fallisce per errore
    const query_runner = this.dataSource.createQueryRunner();
    await query_runner.connect();
    await query_runner.startTransaction();

    try {
      const manager = query_runner.manager;

      // verifica che esistano tutte le sottocompetenze selezionate
      const subcompetencies = await manager.find(SubCompetencyEntity, {
        where: { id: In(dto.subcompetency_ids) },
      });
      if (subcompetencies.length !== dto.subcompetency_ids.length) {
        const found_ids = new Set(subcompetencies.map((s) => s.id));
        const missing_ids = dto.subcompetency_ids.filter((id) => !found_ids.has(id));
        throw new NotFoundException(
          `Sotto-competenze non trovate per gli ID: ${missing_ids.join(', ')}`,
        );
      }

      // creazione e salvataggio di TestEntity
      const created_test = manager.create(TestEntity, {
        assessment_situation: dto.assessment_situation,
        test_designer_id: dto.test_designer_id,
      });
      const saved_test = await manager.save(created_test);

      // popola la tabella N:N test_subcompetency
      if (dto.subcompetency_ids && dto.subcompetency_ids.length > 0) {
        const new_records = dto.subcompetency_ids.map((id) => ({
          test_id: saved_test.id,
          subcompetency_id: id,
        }));
        await manager.insert('test_subcompetency', new_records);
      }

      // popola la tabella N:N test_evaluation
      if (dto.test_evaluator_ids && dto.test_evaluator_ids.length > 0) {
        const new_records = dto.test_evaluator_ids.map((id) => ({
          test_id: saved_test.id,
          test_evaluator_id: id,
        }));
        await manager.insert('test_evaluation', new_records);
      }

      // creazione record in test_execution per ciascun evaluated_user assegnato
      if (dto.evaluated_user_ids && dto.evaluated_user_ids.length > 0) {
        const new_records = dto.evaluated_user_ids.map((id) => ({
          test_id: saved_test.id,
          user_id: id,
          test_score: null,
          max_score: null,
        }));
        await manager.insert('test_execution', new_records);
      }

      // salva la transazione
      await query_runner.commitTransaction();
      return saved_test;
    } catch (error) {
      // annulla tutte le modifiche precedenti (per non sporcare il db)
      await query_runner.rollbackTransaction();

      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        `Errore durante la creazione del test: ${
          (error as Error).message || 'Operazione annullata.'
        }`,
      );
    } finally {
      await query_runner.release();
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
      throw new NotFoundException(`Test designer con ID ${designerId} non trovato.`);
    }

    return this.testsRepository.findByTestDesignerId(designerId);
  }

  async findByEvaluatedUserId(evaluated_user_id: number): Promise<TestEntity[]> {
    return this.testsRepository.findByEvaluatedUserId(evaluated_user_id);
  }

  async update(id: number, dto: UpdateTestDto): Promise<TestEntity> {
    const test = await this.testsRepository.findById(id);
    if (!test) {
      throw new NotFoundException(`Test con ID ${id} non trovato.`);
    }

    if (dto.test_designer_id !== undefined && dto.test_designer_id !== test.test_designer_id) {
      const designer = await this.testDesignerRepository.findById(dto.test_designer_id);
      if (!designer) {
        throw new NotFoundException(`Test designer con ID ${dto.test_designer_id} non trovato.`);
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      if (dto.assessment_situation !== undefined)
        test.assessment_situation = dto.assessment_situation;
      if (dto.test_designer_id !== undefined) test.test_designer_id = dto.test_designer_id;

      const saved_test = await manager.save(test);

      if (dto.subcompetency_ids !== undefined) {
        await manager.delete('test_subcompetency', { test_id: id });
        if (dto.subcompetency_ids.length > 0) {
          const records = dto.subcompetency_ids.map((id) => ({
            test_id: id,
            subcompetency_id: id,
          }));
          await manager.insert('test_subcompetency', records);
        }
      }

      if (dto.test_evaluator_ids !== undefined) {
        await manager.delete('test_evaluation', { test_id: id });
        if (dto.test_evaluator_ids.length > 0) {
          const records = dto.test_evaluator_ids.map((id) => ({
            test_id: id,
            test_evaluator_id: id,
          }));
          await manager.insert('test_evaluation', records);
        }
      }

      if (dto.evaluated_user_ids !== undefined) {
        await manager.delete('test_execution', { test_id: id });
        if (dto.evaluated_user_ids.length > 0) {
          const records = dto.evaluated_user_ids.map((id) => ({
            test_id: id,
            user_id: id,
            test_score: null,
            max_score: null,
          }));
          await manager.insert('test_execution', records);
        }
      }

      await queryRunner.commitTransaction();
      return saved_test;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        `Errore durante l'aggiornamento del test: ${(error as Error).message}`,
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

    const is_deleted = await this.testsRepository.deleteOne(id);
    if (!is_deleted) {
      throw new NotFoundException(
        `Errore durante l'eliminazione. Il test con ID ${id} potrebbe essere già stato rimosso.`,
      );
    }
  }
}

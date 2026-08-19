import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TestEntity } from './entities/test.entity';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { ServerTestsRepository } from './test.repository';
import { ServerTestDesignersRepository } from './test-designer.repository';

@Injectable()
export class ServerTestsService {
  constructor(
    private readonly testsRepository: ServerTestsRepository,
    private readonly testDesignersRepository: ServerTestDesignersRepository
  ) {}

  async create(dto: CreateTestDto): Promise<TestEntity> {
    const designer = await this.testDesignersRepository.findById(
      dto.test_designer_id
    );
    if (!designer) {
      throw new NotFoundException(
        `Test designer con ID ${dto.test_designer_id} non trovato.`
      );
    }

    return this.testsRepository.createOne(dto);
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
    const designer = await this.testDesignersRepository.findById(designerId);
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
      const designer = await this.testDesignersRepository.findById(
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

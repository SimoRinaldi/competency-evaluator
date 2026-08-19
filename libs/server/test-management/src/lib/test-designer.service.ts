import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TestDesignerEntity } from './entities/test-designer.entity';
import { CreateTestDesignerDto } from './dto/create-test-designer.dto';
import { UpdateTestDesignerDto } from './dto/update-test-designer.dto';
import { ServerTestDesignersRepository } from './test-designer.repository';
import { ServerEvaluatedUsersRepository } from './evaluated-user.repository';

@Injectable()
export class ServerTestDesignersService {
  constructor(
    private readonly testDesignersRepository: ServerTestDesignersRepository,
    private readonly evaluatedUsersRepository: ServerEvaluatedUsersRepository
  ) {}

  async create(dto: CreateTestDesignerDto): Promise<TestDesignerEntity> {
    const existing = await this.testDesignersRepository.findByUserId(dto.user_id);
    if (existing) {
      throw new ConflictException(
        `L'utente con ID ${dto.user_id} è già registrato come test designer.`
      );
    }

    const existingEvaluatedUser = await this.evaluatedUsersRepository.findByUserId(
      dto.user_id
    );
    if (existingEvaluatedUser) {
      throw new ConflictException(
        `L'utente con ID ${dto.user_id} è già registrato come evaluated user e non può essere registrato come test designer.`
      );
    }

    return this.testDesignersRepository.createOne(dto);
  }

  async findAll(): Promise<TestDesignerEntity[]> {
    return this.testDesignersRepository.findAll();
  }

  async findOne(id: number): Promise<TestDesignerEntity> {
    const testDesigner = await this.testDesignersRepository.findById(id);

    if (!testDesigner) {
      throw new NotFoundException(`Test designer con ID ${id} non trovato.`);
    }

    return testDesigner;
  }

  async update(
    id: number,
    dto: UpdateTestDesignerDto
  ): Promise<TestDesignerEntity> {
    const testDesigner = await this.testDesignersRepository.findById(id);
    if (!testDesigner) {
      throw new NotFoundException(`Test designer con ID ${id} non trovato.`);
    }

    if (dto.user_id !== undefined && dto.user_id !== testDesigner.user_id) {
      const existing = await this.testDesignersRepository.findByUserId(dto.user_id);
      if (existing) {
        throw new ConflictException(
          `L'utente con ID ${dto.user_id} è già registrato come test designer.`
        );
      }

      const existingEvaluatedUser = await this.evaluatedUsersRepository.findByUserId(
        dto.user_id
      );
      if (existingEvaluatedUser) {
        throw new ConflictException(
          `L'utente con ID ${dto.user_id} è già registrato come evaluated user e non può essere un test designer.`
        );
      }
    }

    return this.testDesignersRepository.updateOne(testDesigner, dto);
  }

  async remove(id: number): Promise<void> {
    const testDesigner = await this.testDesignersRepository.findById(id);
    if (!testDesigner) {
      throw new NotFoundException(`Test designer con ID ${id} non trovato.`);
    }

    const isDeleted = await this.testDesignersRepository.deleteOne(id);
    if (!isDeleted) {
      throw new NotFoundException(
        `Errore durante l'eliminazione. Il test designer con ID ${id} potrebbe essere già stato rimosso.`
      );
    }
  }
}

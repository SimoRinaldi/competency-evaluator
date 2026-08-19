import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EvaluatedUserEntity } from './entities/evaluated-user.entity';
import { CreateEvaluatedUserDto } from './dto/create-evaluated-user.dto';
import { UpdateEvaluatedUserDto } from './dto/update-evaluated-user.dto';
import { ServerEvaluatedUsersRepository } from './evaluated-user.repository';
import { ServerTestDesignersRepository } from './test-designer.repository';

@Injectable()
export class ServerEvaluatedUsersService {
  constructor(
    private readonly evaluatedUsersRepository: ServerEvaluatedUsersRepository,
    private readonly testDesignersRepository: ServerTestDesignersRepository
  ) {}

  async create(dto: CreateEvaluatedUserDto): Promise<EvaluatedUserEntity> {
    const existing = await this.evaluatedUsersRepository.findByUserId(
      dto.user_id
    );
    if (existing) {
      throw new ConflictException(
        `L'utente con ID ${dto.user_id} è già registrato come evaluated user.`
      );
    }

    const existingTestDesigner = await this.testDesignersRepository.findByUserId(
      dto.user_id
    );
    if (existingTestDesigner) {
      throw new ConflictException(
        `L'utente con ID ${dto.user_id} è già registrato come test designer e non può essere registrato come evaluated user.`
      );
    }

    return this.evaluatedUsersRepository.createOne(dto);
  }

  async findAll(): Promise<EvaluatedUserEntity[]> {
    return this.evaluatedUsersRepository.findAll();
  }

  async findOne(id: number): Promise<EvaluatedUserEntity> {
    const evaluatedUser = await this.evaluatedUsersRepository.findById(id);

    if (!evaluatedUser) {
      throw new NotFoundException(`Evaluated user con ID ${id} non trovato.`);
    }

    return evaluatedUser;
  }

  async update(
    id: number,
    dto: UpdateEvaluatedUserDto
  ): Promise<EvaluatedUserEntity> {
    const evaluatedUser = await this.evaluatedUsersRepository.findById(id);
    if (!evaluatedUser) {
      throw new NotFoundException(`Evaluated user con ID ${id} non trovato.`);
    }

    if (dto.user_id !== undefined && dto.user_id !== evaluatedUser.user_id) {
      const existing = await this.evaluatedUsersRepository.findByUserId(
        dto.user_id
      );
      if (existing) {
        throw new ConflictException(
          `L'utente con ID ${dto.user_id} è già registrato come evaluated user.`
        );
      }

      const existingTestDesigner = await this.testDesignersRepository.findByUserId(
        dto.user_id
      );
      if (existingTestDesigner) {
        throw new ConflictException(
          `L'utente con ID ${dto.user_id} è già registrato come test designer e non può essere un evaluated user.`
        );
      }
    }

    return this.evaluatedUsersRepository.updateOne(evaluatedUser, dto);
  }

  async remove(id: number): Promise<void> {
    const evaluatedUser = await this.evaluatedUsersRepository.findById(id);
    if (!evaluatedUser) {
      throw new NotFoundException(`Evaluated user con ID ${id} non trovato.`);
    }

    const isDeleted = await this.evaluatedUsersRepository.deleteOne(id);
    if (!isDeleted) {
      throw new NotFoundException(
        `Errore durante l'eliminazione. L'evaluated user con ID ${id} potrebbe essere già stato rimosso.`
      );
    }
  }
}

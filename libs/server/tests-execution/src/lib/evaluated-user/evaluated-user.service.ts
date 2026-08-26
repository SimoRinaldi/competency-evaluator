import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EvaluatedUserRepository } from './evaluated-user.repository';
import { CreateEvaluatedUserDto } from './dto/create-evaluated-user.dto';
import { UpdateEvaluatedUserDto } from './dto/update-evaluated-user.dto';
import { EvaluatedUserEntity } from './entities/evaluated-user.entity';
import { ServerUsersService } from '@server/users';

@Injectable()
export class EvaluatedUserService {
  constructor(
    private readonly repository: EvaluatedUserRepository,
    private readonly usersService: ServerUsersService
  ) {}

  async create(dto: CreateEvaluatedUserDto): Promise<EvaluatedUserEntity> {
    await this.usersService.getOneUser(dto.user_id);

    const existing = await this.repository.findByUserId(dto.user_id);
    if (existing) {
      throw new ConflictException(
        `L'utente con ID ${dto.user_id} è già registrato come Evaluated User.`
      );
    }

    return this.repository.createOne(dto);
  }

  async findAll(): Promise<EvaluatedUserEntity[]> {
    return this.repository.findAll();
  }

  async findOne(id: number): Promise<EvaluatedUserEntity> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundException(`Evaluated User con ID ${id} non trovato.`);
    }
    return user;
  }

  async findByUserId(userId: number): Promise<EvaluatedUserEntity | null> {
    return this.repository.findByUserId(userId);
  }

  async update(
    id: number,
    dto: UpdateEvaluatedUserDto
  ): Promise<EvaluatedUserEntity> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundException(`Evaluated User con ID ${id} non trovato.`);
    }

    if (dto.user_id !== undefined && dto.user_id !== user.user_id) {
      await this.usersService.getOneUser(dto.user_id);
      const existing = await this.repository.findByUserId(dto.user_id);
      if (existing) {
        throw new ConflictException(
          `L'utente con ID ${dto.user_id} è già registrato come Evaluated User.`
        );
      }
    }

    return this.repository.updateOne(user, dto);
  }

  async remove(id: number): Promise<void> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundException(`Evaluated User con ID ${id} non trovato.`);
    }

    const isDeleted = await this.repository.deleteOne(id);
    if (!isDeleted) {
      throw new NotFoundException(
        `Errore durante l'eliminazione dell'Evaluated User con ID ${id}.`
      );
    }
  }
}

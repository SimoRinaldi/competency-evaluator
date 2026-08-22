import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { UserEntity } from './user.entity';
import { UserRole } from './dto/user-role.enum';
import { EvaluatedUserEntity } from './entities/evaluated-user.entity';
import { TestDesignerEntity } from './entities/test-designer.entity';
import { EvaluatedUsersRepository } from './repositories/evaluated-user.repository';
import { TestDesignersRepository } from './repositories/test-designer.repository';

@Injectable()
export class ServerUsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly evaluatedUsersRepository: EvaluatedUsersRepository,
    private readonly testDesignersRepository: TestDesignersRepository,
    private readonly dataSource: DataSource
  ) {}

  async findByEmail(email: string): Promise<UserEntity> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async getOneUser(id: number): Promise<UserEntity> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async getUsers(role?: UserRole): Promise<UserEntity[]> {
    const users = await this.usersRepository.findAll(role);

    if (role && users.length === 0) {
      throw new NotFoundException(`No users found with role ${role}`);
    }
    return users;
  }

  async create(dto: CreateUserDto): Promise<UserEntity> {
    const existing = dto.email
      ? await this.usersRepository.findByEmail(dto.email)
      : null;

    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    // con transaction diventa una operazione atomica
    return this.dataSource.transaction(async (manager) => {
      const user = manager.create(UserEntity, {
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: dto.role,
      });
      const savedUser = await manager.save(user);

      switch (savedUser.role) {
        case UserRole.USER:
          await manager.save(
            manager.create(EvaluatedUserEntity, { user_id: savedUser.id })
          );
          break;
        case UserRole.TEST_DESIGNER:
          await manager.save(
            manager.create(TestDesignerEntity, { user_id: savedUser.id })
          );
          break;
        case UserRole.EVALUATOR:
          // TODO: aggiungere la create di test_evaluator
          break;
        case UserRole.ADMIN:
          break;
      }

      return savedUser;
    });
  }

  async update(id: number, dto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.usersRepository.findByEmail(dto.email);
      if (existing && existing.id !== id) {
        throw new ConflictException('Email already in use');
      }
    }

    const oldRole = user.role;
    const newRole = dto.role ?? oldRole;

    return this.dataSource.transaction(async (manager) => {
      if (dto.name !== undefined) user.name = dto.name;
      if (dto.email !== undefined) user.email = dto.email;
      if (dto.role !== undefined) user.role = dto.role;

      const updatedUser = await manager.save(user);

      if (dto.role !== undefined && newRole !== oldRole) {

        // creo i profili nuovi
        // si potrebbe anche pensare di eliminare quelli vecchi ma secondo me ha poco
        // senso, già l'update del ruolo non so se servirà
        if (newRole === UserRole.USER) {
          await manager.save(
            manager.create(EvaluatedUserEntity, { user_id: id })
          );
        } else if (newRole === UserRole.TEST_DESIGNER) {
          await manager.save(
            manager.create(TestDesignerEntity, { user_id: id })
          );
        } else if (newRole === UserRole.EVALUATOR) {
          // TODO: aggiungere la create di test_evaluator
        }
      }

      return updatedUser;
    });
  }

  async removeUser(id: number): Promise<void> {
    const deleted = await this.usersRepository.deleteOne(id);
    if (!deleted) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  // Helpers
  async findEvaluatedUserByUserId(userId: number): Promise<EvaluatedUserEntity | null> {
    return this.evaluatedUsersRepository.findByUserId(userId);
  }

  async findTestDesignerByUserId(userId: number): Promise<TestDesignerEntity | null> {
    return this.testDesignersRepository.findByUserId(userId);
  }

  async findEvaluatedUserById(id: number): Promise<EvaluatedUserEntity | null> {
    return this.evaluatedUsersRepository.findById(id);
  }

  async findTestDesignerById(id: number): Promise<TestDesignerEntity | null> {
    return this.testDesignersRepository.findById(id);
  }
}

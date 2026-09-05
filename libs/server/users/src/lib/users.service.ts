import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { UserEntity } from './user.entity';
import { UserRole } from './dto/user-role.enum';
import * as bcrypt from 'bcrypt';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findByEmail(email: string): Promise<UserEntity> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) throw new NotFoundException(`User with email ${email} not found`);

    return user;
  }

  async getOneUser(id: number): Promise<UserEntity> {
    const user = await this.usersRepository.findById(id);

    if (!user) throw new NotFoundException(`User with id ${id} not found`);

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
    const existing = dto.email ? await this.usersRepository.findByEmail(dto.email) : null;

    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const password_hash = await bcrypt.hash(dto.password, 10);
    const saved_user = await this.usersRepository.createOne(dto, password_hash);

    // lancia evento di creazione
    this.eventEmitter.emit('user.created', saved_user);

    return saved_user;
  }

  async update(id: number, dto: UpdateUserDto): Promise<UserEntity> {
    if (dto.email) {
      const existing = await this.usersRepository.findByEmail(dto.email);
      if (existing && existing.id !== id) {
        throw new ConflictException('Email already in use');
      }
    }

    const updated = await this.usersRepository.updateOne(id, dto);
    if (!updated) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return updated;
  }

  async updatePassword(id: number, old_pass: string, new_pass: string): Promise<void> {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    const password_matches = await bcrypt.compare(old_pass, user.passwordHash);
    if (!password_matches) {
      throw new ConflictException('La vecchia password non è corretta');
    }

    const new_hash = await bcrypt.hash(new_pass, 10);
    await this.usersRepository.updatePasswordHash(id, new_hash);
  }

  async removeUser(id: number): Promise<void> {
    const deleted = await this.usersRepository.deleteOne(id);
    if (!deleted) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }
}

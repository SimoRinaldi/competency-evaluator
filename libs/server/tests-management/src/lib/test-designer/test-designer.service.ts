import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TestDesignerRepository } from './test-designer.repository';
import { CreateTestDesignerDto } from './dto/create-test-designer.dto';
import { UpdateTestDesignerDto } from './dto/update-test-designer.dto';
import { TestDesignerEntity } from './entities/test-designer.entity';
import { UsersService } from '@server/users';

@Injectable()
export class TestDesignerService {
  constructor(
    private readonly repository: TestDesignerRepository,
    private readonly usersService: UsersService
  ) {}

  async create(dto: CreateTestDesignerDto): Promise<TestDesignerEntity> {
    await this.usersService.getOneUser(dto.user_id);

    const existing = await this.repository.findByUserId(dto.user_id);
    if (existing) {
      throw new ConflictException(
        `L'utente con ID ${dto.user_id} è già registrato come Test Designer.`
      );
    }

    return this.repository.createOne(dto);
  }

  async findAll(): Promise<TestDesignerEntity[]> {
    return this.repository.findAll();
  }

  async findOne(id: number): Promise<TestDesignerEntity> {
    const designer = await this.repository.findById(id);
    if (!designer) {
      throw new NotFoundException(`Test Designer con ID ${id} non trovato.`);
    }
    return designer;
  }

  async findByUserId(userId: number): Promise<TestDesignerEntity | null> {
    return this.repository.findByUserId(userId);
  }

  async update(
    id: number,
    dto: UpdateTestDesignerDto
  ): Promise<TestDesignerEntity> {
    const designer = await this.repository.findById(id);
    if (!designer) {
      throw new NotFoundException(`Test Designer con ID ${id} non trovato.`);
    }

    if (dto.user_id !== undefined && dto.user_id !== designer.user_id) {
      await this.usersService.getOneUser(dto.user_id);
      const existing = await this.repository.findByUserId(dto.user_id);
      if (existing) {
        throw new ConflictException(
          `L'utente con ID ${dto.user_id} è già registrato come Test Designer.`
        );
      }
    }

    return this.repository.updateOne(designer, dto);
  }

  async remove(id: number): Promise<void> {
    const designer = await this.repository.findById(id);
    if (!designer) {
      throw new NotFoundException(`Test Designer con ID ${id} non trovato.`);
    }

    const isDeleted = await this.repository.deleteOne(id);
    if (!isDeleted) {
      throw new NotFoundException(
        `Errore durante l'eliminazione del Test Designer con ID ${id}.`
      );
    }
  }
}

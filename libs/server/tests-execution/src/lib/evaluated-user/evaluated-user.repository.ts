import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvaluatedUserEntity } from './entities/evaluated-user.entity';
import { CreateEvaluatedUserDto } from './dto/create-evaluated-user.dto';
import { UpdateEvaluatedUserDto } from './dto/update-evaluated-user.dto';

@Injectable()
export class EvaluatedUserRepository {
  constructor(
    @InjectRepository(EvaluatedUserEntity)
    private readonly repository: Repository<EvaluatedUserEntity>,
  ) {}

  async createOne(dto: CreateEvaluatedUserDto): Promise<EvaluatedUserEntity> {
    const user = this.repository.create({ user_id: dto.user_id });
    return this.repository.save(user);
  }

  async findAll(): Promise<EvaluatedUserEntity[]> {
    return this.repository.find({
      relations: ['user', 'test_executions'],
    });
  }

  async findById(id: number): Promise<EvaluatedUserEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['user', 'test_executions'],
    });
  }

  async findByUserId(user_id: number): Promise<EvaluatedUserEntity | null> {
    return this.repository.findOne({
      where: { user_id },
      relations: ['user', 'test_executions'],
    });
  }

  async updateOne(
    evaluated_user: EvaluatedUserEntity,
    dto: UpdateEvaluatedUserDto,
  ): Promise<EvaluatedUserEntity> {
    if (dto.user_id !== undefined) evaluated_user.user_id = dto.user_id;
    return this.repository.save(evaluated_user);
  }

  async deleteOne(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

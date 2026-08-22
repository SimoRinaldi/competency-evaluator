import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvaluatedUserEntity } from '../entities/evaluated-user.entity';

@Injectable()
export class EvaluatedUsersRepository {
  constructor(
    @InjectRepository(EvaluatedUserEntity)
    private readonly repository: Repository<EvaluatedUserEntity>
  ) {}

  async createOne(user_id: number): Promise<EvaluatedUserEntity> {
    const evaluatedUser = this.repository.create({ user_id });
    return this.repository.save(evaluatedUser);
  }

  async findAll(): Promise<EvaluatedUserEntity[]> {
    return this.repository.find({
      order: { id: 'ASC' },
      relations: ['user'],
    });
  }

  async findById(id: number): Promise<EvaluatedUserEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findByUserId(user_id: number): Promise<EvaluatedUserEntity | null> {
    return this.repository.findOne({
      where: { user_id },
      relations: ['user'],
    });
  }

  async deleteOne(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async deleteByUserId(user_id: number): Promise<boolean> {
    const result = await this.repository.delete({ user_id });
    return (result.affected ?? 0) > 0;
  }
}

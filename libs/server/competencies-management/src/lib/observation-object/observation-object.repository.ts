import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObservationObjectEntity } from './entities/observation-object.entity';
import { CreateObservationObjectDto } from './dto/create-observation-object.dto';
import { UpdateObservationObjectDto } from './dto/update-observation-object.dto';

@Injectable()
export class ObservationObjectRepository {
  constructor(
    @InjectRepository(ObservationObjectEntity)
    private readonly repository: Repository<ObservationObjectEntity>
  ) {}

  async createOne(
    dto: CreateObservationObjectDto
  ): Promise<ObservationObjectEntity> {
    const obj = this.repository.create({
      description: dto.description,
      subcompetency_id: dto.subcompetency_id,
    });
    return this.repository.save(obj);
  }

  async findAll(): Promise<ObservationObjectEntity[]> {
    return this.repository.find({
      order: { id: 'ASC' },
      relations: ['indicators', 'subcompetency'],
    });
  }

  async findById(id: number): Promise<ObservationObjectEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['indicators', 'subcompetency'],
    });
  }

  async updateOne(
    id: number,
    dto: UpdateObservationObjectDto
  ): Promise<ObservationObjectEntity | null> {
    const obj = await this.findById(id);
    if (!obj) {
      return null;
    }
    if (dto.description !== undefined) obj.description = dto.description;
    if (dto.subcompetency_id !== undefined)
      obj.subcompetency_id = dto.subcompetency_id;

    return this.repository.save(obj);
  }

  async deleteOne(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

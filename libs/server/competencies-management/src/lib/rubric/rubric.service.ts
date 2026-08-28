import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { RubricRepository } from './rubric.repository';
import { CreateRubricSetDto } from './dto/create-rubric.dto';
import { UpdateRubricSetDto } from './dto/update-rubric.dto';
import { RubricSetEntity } from './entities/rubric-set.entity';

@Injectable()
export class RubricService {
  constructor(private readonly rubricRepository: RubricRepository) {}

  async create(
    createRubricSetDto: CreateRubricSetDto
  ): Promise<RubricSetEntity> {
    this.validateRubricLevels(
      createRubricSetDto.yes_no,
      createRubricSetDto.levels
    );
    return this.rubricRepository.createOne(createRubricSetDto);
  }

  async findAll(): Promise<RubricSetEntity[]> {
    return this.rubricRepository.findAll();
  }

  async findOne(id: number): Promise<RubricSetEntity> {
    const set = await this.rubricRepository.findById(id);
    if (!set) {
      throw new NotFoundException(`RubricSet con ID ${id} non trovato`);
    }
    return set;
  }

  async update(
    id: number,
    updateRubricSetDto: UpdateRubricSetDto
  ): Promise<RubricSetEntity> {
    const existing = await this.findOne(id);
    const newYesNo = updateRubricSetDto.yes_no ?? existing.yes_no;

    if (updateRubricSetDto.levels) {
      const merged_levels = updateRubricSetDto.levels.map((incoming_level) => {
        if (incoming_level.id && existing.levels) {
          const old_level = existing.levels.find(
            (l) => l.id === incoming_level.id
          );
          return { ...old_level, ...incoming_level };
        }
        return incoming_level;
      });
      this.validateRubricLevels(newYesNo, merged_levels);
      updateRubricSetDto.levels = merged_levels; // Usiamo i livelli completi per l'update manuale
    } else if (
      updateRubricSetDto.yes_no !== undefined &&
      updateRubricSetDto.yes_no !== existing.yes_no
    )
      throw new BadRequestException(
        'Impossibile cambiare yes_no senza fornire i nuovi levels aggiornati che rispettino la regola.'
      );

    const rubric_set = await this.rubricRepository.updateOne(
      id,
      updateRubricSetDto
    );
    if (!rubric_set) {
      throw new NotFoundException(`RubricSet con ID ${id} non trovato`);
    }
    return rubric_set;
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const deleted = await this.rubricRepository.deleteOne(id);
    if (!deleted) {
      throw new NotFoundException(`RubricSet con ID ${id} non trovato`);
    }
    return { deleted: true };
  }

  private validateRubricLevels(yes_no: boolean, levels: any[]) {
    if (yes_no) {
      if (levels.length !== 2)
        throw new BadRequestException(
          'Un RubricSet binario (yes_no = true) deve avere esattamente 2 RubricLevel.'
        );

      const ranks = levels.map((l) => l.rank).sort((a, b) => a - b);
      if (ranks[0] !== 1 || ranks[1] !== 5)
        throw new BadRequestException(
          'I rank per un RubricSet binario devono essere esattamente 1 e 5.'
        );
    } else {
      if (levels.length !== 5)
        throw new BadRequestException(
          'Un RubricSet standard (yes_no = false) deve avere esattamente 5 RubricLevel.'
        );

      const ranks = levels.map((l) => l.rank).sort((a, b) => a - b);
      if (ranks.join(',') !== '1,2,3,4,5')
        throw new BadRequestException(
          'I rank per un RubricSet standard devono essere esattamente 1, 2, 3, 4 e 5.'
        );
    }
  }
}

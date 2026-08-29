import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { RubricRepository } from './rubric.repository';
import { CreateRubricSetDto } from './dto/create-rubric.dto';
import { UpdateRubricSetDto } from './dto/update-rubric.dto';
import { RubricSetEntity } from './entities/rubric-set.entity';
import { RubricLevelEntity } from './entities/rubric-level.entity';
import { validateRubricLevelsStructure } from './validators/rubric-levels-count.validator';

@Injectable()
export class RubricService {
  constructor(private readonly rubricRepository: RubricRepository) {}

  async create(createRubricSetDto: CreateRubricSetDto): Promise<RubricSetEntity> {
    await this.validateDuplicateRubricSet(createRubricSetDto.levels);
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

  async update(id: number, updateRubricSetDto: UpdateRubricSetDto): Promise<RubricSetEntity> {
    const existing = await this.findOne(id);
    const newYesNo = updateRubricSetDto.yes_no ?? existing.yes_no;

    if (updateRubricSetDto.levels) {
      const merged_levels = updateRubricSetDto.levels.map((incoming_level) => {
        if (incoming_level.id && existing.levels) {
          const old_level = existing.levels.find((l) => l.id === incoming_level.id);
          return { ...old_level, ...incoming_level };
        }
        return incoming_level;
      });

      const validationError = validateRubricLevelsStructure(newYesNo, merged_levels);
      if (validationError) {
        throw new BadRequestException(validationError);
      }

      await this.validateDuplicateRubricSet(merged_levels as RubricLevelEntity[], id);
      updateRubricSetDto.levels = merged_levels; // Usiamo i livelli completi per l'update manuale
    } else if (
      updateRubricSetDto.yes_no !== undefined &&
      updateRubricSetDto.yes_no !== existing.yes_no
    )
      throw new BadRequestException(
        'Impossibile cambiare yes_no senza fornire i nuovi levels aggiornati che rispettino la regola.',
      );

    const rubric_set = await this.rubricRepository.updateOne(id, updateRubricSetDto);
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

  async findMatchingRubricSet(
    levels: Array<{ description: string; rank: number }>,
    excludeRubricSetId?: number,
  ): Promise<RubricSetEntity | null> {
    const rubric_sets = await this.rubricRepository.findAll();

    const matching = rubric_sets.find((set) => {
      if (excludeRubricSetId && set.id === excludeRubricSetId) {
        return false;
      }
      if (set.levels.length !== levels.length) {
        return false;
      }
      return set.levels.every((existingLevel) =>
        levels.some(
          (newLevel) =>
            newLevel.description === existingLevel.description &&
            newLevel.rank === existingLevel.rank,
        ),
      );
    });

    return matching ?? null;
  }

  async validateDuplicateRubricSet(
    levels: Array<{ description: string; rank: number }>,
    excludeRubricSetId?: number,
  ): Promise<void> {
    const duplicate = await this.findMatchingRubricSet(levels, excludeRubricSetId);
    if (duplicate) {
      throw new ConflictException(
        'Esiste già un rubric set con lo stesso insieme di livelli',
      );
    }
  }
}

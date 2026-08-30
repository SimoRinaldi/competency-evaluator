import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SubCompetencyHistoricalScoreRepository } from './subcompetency-historical-score.repository';
import { CreateSubCompetencyHistoricalScoreDto } from './dto/create-subcompetency-historical-score.dto';
import { UpdateSubCompetencyHistoricalScoreDto } from './dto/update-subcompetency-historical-score.dto';
import { SubCompetencyHistoricalScoreEntity } from './entities/subcompetency-historical-score.entity';

@Injectable()
export class SubCompetencyHistoricalScoreService {
  constructor(
    private readonly repository: SubCompetencyHistoricalScoreRepository
  ) {}

  async create(
    dto: CreateSubCompetencyHistoricalScoreDto
  ): Promise<SubCompetencyHistoricalScoreEntity> {
    const existing = await this.findByUserAndSubCompetency(
      dto.user_id,
      dto.subcompetency_id
    );

    if (existing) {
      throw new ConflictException(
        `L'utente con ID ${dto.user_id} ha già un punteggio registrato per la sotto-competenza con ID ${dto.subcompetency_id}.`
      );
    }

    return this.repository.createOne(dto);
  }

  async findAll(): Promise<SubCompetencyHistoricalScoreEntity[]> {
    return this.repository.findAll();
  }

  async findOne(id: number): Promise<SubCompetencyHistoricalScoreEntity> {
    const score = await this.repository.findById(id);

    if (!score) {
      throw new NotFoundException(
        `SubCompetency Historical Score con ID ${id} non trovato.`
      );
    }

    return score;
  }

  async findByUserAndSubCompetency(
    userId: number,
    subcompetencyId: number
  ): Promise<SubCompetencyHistoricalScoreEntity | null> {
    return this.repository.findByUserAndSubCompetency(userId, subcompetencyId);
  }

  async findAcquiredSubCompetencies(
      user_id: number,
    ): Promise <SubCompetencyHistoricalScoreEntity[]> {
      const acquiredSubCompetencies = await this.repository.findAcquiredSubCompetencies(user_id);
      if (acquiredSubCompetencies.length === 0)
        throw new NotFoundException(`Nessuna sotto-competenza acquisita trovata per l'utente ${user_id}`);
  
      return acquiredSubCompetencies;
    }

  async findByUser(
    user_id: number,
  ): Promise <SubCompetencyHistoricalScoreEntity[]> {
    return this.repository.findByUser(user_id);
  }

  async update(
    id: number,
    dto: UpdateSubCompetencyHistoricalScoreDto
  ): Promise<SubCompetencyHistoricalScoreEntity> {
    const score = await this.repository.findById(id);
    if (!score) {
      throw new NotFoundException(
        `SubCompetency Historical Score con ID ${id} non trovato.`
      );
    }

    return this.repository.updateOne(score, dto);
  }

  async remove(id: number): Promise<void> {
    const score = await this.repository.findById(id);
    if (!score) {
      throw new NotFoundException(
        `SubCompetency Historical Score con ID ${id} non trovato.`
      );
    }

    const isDeleted = await this.repository.deleteOne(id);
    if (!isDeleted) {
      throw new NotFoundException(
        `Errore durante l'eliminazione. Il SubCompetency Historical Score con ID ${id} potrebbe essere già stato rimosso.`
      );
    }
  }
}

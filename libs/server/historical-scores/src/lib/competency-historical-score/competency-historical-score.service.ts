import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CompetencyHistoricalScoreRepository } from './competency-historical-score.repository';
import { CreateCompetencyHistoricalScoreDto } from './dto/create-competency-historical-score.dto';
import { UpdateCompetencyHistoricalScoreDto } from './dto/update-competency-historical-score.dto';
import { CompetencyHistoricalScoreEntity } from './entities/competency-historical-score.entity';

@Injectable()
export class CompetencyHistoricalScoreService {
  constructor(
    private readonly repository: CompetencyHistoricalScoreRepository
  ) {}

  async create(
    dto: CreateCompetencyHistoricalScoreDto
  ): Promise<CompetencyHistoricalScoreEntity> {
    const existing = await this.findByUserAndCompetency(
      dto.user_id,
      dto.competency_id
    );

    if (existing) {
      throw new ConflictException(
        `L'utente con ID ${dto.user_id} ha già un punteggio registrato per la competenza con ID ${dto.competency_id}.`
      );
    }

    return this.repository.createOne(dto);
  }

  async findAll(): Promise<CompetencyHistoricalScoreEntity[]> {
    return this.repository.findAll();
  }

  async findOne(id: number): Promise<CompetencyHistoricalScoreEntity> {
    const score = await this.repository.findById(id);

    if (!score) {
      throw new NotFoundException(
        `Competency Historical Score con ID ${id} non trovato.`
      );
    }

    return score;
  }

  async findByUserAndCompetency(
    userId: number,
    competencyId: number
  ): Promise<CompetencyHistoricalScoreEntity | null> {
    return await this.repository.findByUserAndCompetency(userId, competencyId);
  }

  async findAcquiredCompetencies(
    user_id: number,
  ): Promise <CompetencyHistoricalScoreEntity[]> {
    const acquiredCompetencies = await this.repository.findAcquiredCompetencies(user_id);
    if (acquiredCompetencies.length === 0)
      throw new NotFoundException(`Nessuna competenza acquisita trovata per l'utente ${user_id}`);

    return acquiredCompetencies;
  }

  async update(
    id: number,
    dto: UpdateCompetencyHistoricalScoreDto
  ): Promise<CompetencyHistoricalScoreEntity> {
    const score = await this.repository.findById(id);
    if (!score) {
      throw new NotFoundException(
        `Competency Historical Score con ID ${id} non trovato.`
      );
    }

    return this.repository.updateOne(score, dto);
  }

  async remove(id: number): Promise<void> {
    const score = await this.repository.findById(id);
    if (!score) {
      throw new NotFoundException(
        `Competency Historical Score con ID ${id} non trovato.`
      );
    }

    const isDeleted = await this.repository.deleteOne(id);
    if (!isDeleted) {
      throw new NotFoundException(
        `Errore durante l'eliminazione. Il Competency Historical Score con ID ${id} potrebbe essere già stato rimosso.`
      );
    }
  }
}

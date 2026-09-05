import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { BestCompetencyScoreRepository } from './best-competency-score.repository';
import { CreateBestCompetencyScoreDto } from './dto/create-best-competency-score.dto';
import { UpdateBestCompetencyScoreDto } from './dto/update-best-competency-score.dto';
import { BestCompetencyScoreEntity } from './entities/best-competency-score.entity';

@Injectable()
export class BestCompetencyScoreService {
  constructor(private readonly repository: BestCompetencyScoreRepository) {}

  async create(dto: CreateBestCompetencyScoreDto): Promise<BestCompetencyScoreEntity> {
    const existing = await this.findByUserAndCompetency(dto.user_id, dto.competency_id);

    if (existing) {
      throw new ConflictException(
        `L'utente con ID ${dto.user_id} ha già un punteggio registrato per la competenza con ID ${dto.competency_id}.`,
      );
    }

    return this.repository.createOne(dto);
  }

  async findAll(): Promise<BestCompetencyScoreEntity[]> {
    return this.repository.findAll();
  }

  async findOne(id: number): Promise<BestCompetencyScoreEntity> {
    const score = await this.repository.findById(id);

    if (!score) {
      throw new NotFoundException(`BestCompetencyScore con ID ${id} non trovato.`);
    }

    return score;
  }

  async findByUserAndCompetency(
    userId: number,
    competencyId: number,
  ): Promise<BestCompetencyScoreEntity | null> {
    return await this.repository.findByUserAndCompetency(userId, competencyId);
  }

  async findAcquiredCompetencies(user_id: number): Promise<BestCompetencyScoreEntity[]> {
    const acquiredCompetencies = await this.repository.findAcquiredCompetencies(user_id);
    if (acquiredCompetencies.length === 0)
      throw new NotFoundException(`Nessuna competenza acquisita trovata per l'utente ${user_id}`);

    return acquiredCompetencies;
  }

  async findByUser(user_id: number): Promise<BestCompetencyScoreEntity[]> {
    return this.repository.findByUser(user_id);
  }

  async update(id: number, dto: UpdateBestCompetencyScoreDto): Promise<BestCompetencyScoreEntity> {
    const score = await this.repository.findById(id);
    if (!score) {
      throw new NotFoundException(`BestCompetencyScore con ID ${id} non trovato.`);
    }

    return this.repository.updateOne(score, dto);
  }

  async remove(id: number): Promise<void> {
    const score = await this.repository.findById(id);
    if (!score) {
      throw new NotFoundException(`BestCompetencyScore con ID ${id} non trovato.`);
    }

    const isDeleted = await this.repository.deleteOne(id);
    if (!isDeleted) {
      throw new NotFoundException(
        `Errore durante l'eliminazione. Il BestCompetencyScore con ID ${id} potrebbe essere già stato rimosso.`,
      );
    }
  }
}

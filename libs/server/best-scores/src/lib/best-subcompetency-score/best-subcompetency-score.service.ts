import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { BestSubCompetencyScoreRepository } from './best-subcompetency-score.repository';
import { CreateBestSubCompetencyScoreDto } from './dto/create-best-subcompetency-score.dto';
import { UpdateBestSubCompetencyScoreDto } from './dto/update-best-subcompetency-score.dto';
import { BestSubCompetencyScoreEntity } from './entities/best-subcompetency-score.entity';

@Injectable()
export class BestSubCompetencyScoreService {
  constructor(private readonly repository: BestSubCompetencyScoreRepository) {}

  async create(dto: CreateBestSubCompetencyScoreDto): Promise<BestSubCompetencyScoreEntity> {
    const existing = await this.findByUserAndSubCompetency(dto.user_id, dto.subcompetency_id);

    if (existing) {
      throw new ConflictException(
        `L'utente con ID ${dto.user_id} ha già un punteggio registrato per la sotto-competenza con ID ${dto.subcompetency_id}.`,
      );
    }

    return this.repository.createOne(dto);
  }

  async findAll(): Promise<BestSubCompetencyScoreEntity[]> {
    return this.repository.findAll();
  }

  async findOne(id: number): Promise<BestSubCompetencyScoreEntity> {
    const score = await this.repository.findById(id);

    if (!score) {
      throw new NotFoundException(`BestSubCompetencyScore con ID ${id} non trovato.`);
    }

    return score;
  }

  async findByUserAndSubCompetency(
    userId: number,
    subcompetencyId: number,
  ): Promise<BestSubCompetencyScoreEntity | null> {
    return this.repository.findByUserAndSubCompetency(userId, subcompetencyId);
  }

  async findAcquiredSubCompetencies(user_id: number): Promise<BestSubCompetencyScoreEntity[]> {
    const acquiredSubCompetencies = await this.repository.findAcquiredSubCompetencies(user_id);
    if (acquiredSubCompetencies.length === 0)
      throw new NotFoundException(
        `Nessuna sotto-competenza acquisita trovata per l'utente ${user_id}`,
      );

    return acquiredSubCompetencies;
  }

  async findByUser(user_id: number): Promise<BestSubCompetencyScoreEntity[]> {
    return this.repository.findByUser(user_id);
  }

  async update(
    id: number,
    dto: UpdateBestSubCompetencyScoreDto,
  ): Promise<BestSubCompetencyScoreEntity> {
    const score = await this.repository.findById(id);
    if (!score) {
      throw new NotFoundException(`BestSubCompetencyScore con ID ${id} non trovato.`);
    }

    return this.repository.updateOne(score, dto);
  }

  async remove(id: number): Promise<void> {
    const score = await this.repository.findById(id);
    if (!score) {
      throw new NotFoundException(`BestSubCompetencyScore con ID ${id} non trovato.`);
    }

    const isDeleted = await this.repository.deleteOne(id);
    if (!isDeleted) {
      throw new NotFoundException(
        `Errore durante l'eliminazione. Il BestSubCompetencyScore con ID ${id} potrebbe essere già stato rimosso.`,
      );
    }
  }
}

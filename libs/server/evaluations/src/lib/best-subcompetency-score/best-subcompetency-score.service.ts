import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BestSubCompetencyScoreRepository } from './best-subcompetency-score.repository';
import { CreateBestSubCompetencyScoreDto } from './dto/create-best-subcompetency-score.dto';
import { BestSubCompetencyScoreEntity } from './entities/best-subcompetency-score.entity';
import { UpdateBestSubCompetencyScoreDto } from './dto/update-best-subcompetency-score.dto';

@Injectable()
export class BestSubCompetencyScoreService {
  constructor(
    private readonly bestSubCompetencyScoresRepository: BestSubCompetencyScoreRepository
  ) {}

  async create(
    dto: CreateBestSubCompetencyScoreDto
  ): Promise<BestSubCompetencyScoreEntity> {
    const existing = await this.findByUserAndSubCompetency(
      dto.user_id,
      dto.subcompetency_id
    );

    if (existing) {
      throw new ConflictException(
        `L'utente con ID ${dto.user_id} ha già un punteggio registrato per la sotto-competenza con ID ${dto.subcompetency_id}.`
      );
    }

    return this.bestSubCompetencyScoresRepository.createOne(dto);
  }

  async findAll(): Promise<BestSubCompetencyScoreEntity[]> {
    return this.bestSubCompetencyScoresRepository.findAll();
  }

  async findOne(id: number): Promise<BestSubCompetencyScoreEntity> {
    const bscs = await this.bestSubCompetencyScoresRepository.findById(id);

    if (!bscs) {
      throw new NotFoundException(
        `Best SubCompetency Score con ID ${id} non trovato.`
      );
    }

    return bscs;
  }

  async findByUserAndSubCompetency(
    userId: number,
    subcompetencyId: number
  ): Promise<BestSubCompetencyScoreEntity | null> {
    return this.bestSubCompetencyScoresRepository.findByUserAndSubCompetency(
      userId,
      subcompetencyId
    );
  }

  async update(
    id: number,
    dto: UpdateBestSubCompetencyScoreDto
  ): Promise<BestSubCompetencyScoreEntity> {
    const bscs = await this.bestSubCompetencyScoresRepository.findById(id);
    if (!bscs) {
      throw new NotFoundException(
        `Best SubCompetency Score con ID ${id} non trovato.`
      );
    }

    return this.bestSubCompetencyScoresRepository.updateOne(bscs, dto);
  }

  async remove(id: number): Promise<void> {
    const bscs = await this.bestSubCompetencyScoresRepository.findById(id);
    if (!bscs) {
      throw new NotFoundException(
        `Best SubCompetency Score con ID ${id} non trovato.`
      );
    }

    const isDeleted = await this.bestSubCompetencyScoresRepository.deleteOne(id);
    if (!isDeleted) {
      throw new NotFoundException(
        `Errore durante l'eliminazione. Il Best SubCompetency Score con ID ${id} potrebbe essere già stato rimosso.`
      );
    }
  }
}

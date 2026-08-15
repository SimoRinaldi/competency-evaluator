import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ServerBestCompetencyScoresRepository } from './best-competency-score.repository';
import { BestCompetencyScoreEntity } from './entities/best-competency-score.entity';
import { CreateBestCompetencyScoreDto } from './dto/create-best-competency-score.dto';
import { UpdateBestCompetencyScoreDto } from './dto/update-best-competency-score.dto';

@Injectable()
export class ServerBestCompetencyScoresService {
    constructor( 
        private readonly bestCompetencyScoresRepository: ServerBestCompetencyScoresRepository 
    ){}

    async create(dto: CreateBestCompetencyScoreDto): Promise<BestCompetencyScoreEntity> {
        const existing = await this.bestCompetencyScoresRepository.findByUserAndCompetency(
            dto.user_id,
            dto.competency_id
        );

        if (existing)
            throw new ConflictException(
                `L'utente con ID ${dto.user_id} ha già un punteggio registrato per la competenza con ID ${dto.competency_id}.`
            )

        return this.bestCompetencyScoresRepository.createOne(dto);
    }

    async findAll(): Promise<BestCompetencyScoreEntity[]> {
        return this.bestCompetencyScoresRepository.findAll();
    }

    async findOne(id: number): Promise<BestCompetencyScoreEntity> {
        const bcs = await this.bestCompetencyScoresRepository.findById(id);

        if (!bcs) 
            throw new NotFoundException(`Best Competency Score con ID ${id} non trovato.`);

        return bcs;
    }

    async update(id: number, dto: UpdateBestCompetencyScoreDto) {
        const bcs = await this.bestCompetencyScoresRepository.findById(id);
        if (!bcs) {
            throw new NotFoundException(`Best Competency Score ${id} non trovato.`);
        }

        return this.bestCompetencyScoresRepository.updateOne(bcs, dto);
    }

    async remove(id: number): Promise<void> {
        const bcs = await this.bestCompetencyScoresRepository.findById(id);
        if (!bcs) {
            throw new NotFoundException(`Best Competency Score con ID ${id} non trovato.`)
        }

        const isDeleted = await this.bestCompetencyScoresRepository.deleteOne(id);
        if (!isDeleted) {
            throw new NotFoundException(`Errore durante l'eliminazione. Il Best Competency Score con ID ${id} potrebbe essere già stato rimosso.`);
        }
    }
}
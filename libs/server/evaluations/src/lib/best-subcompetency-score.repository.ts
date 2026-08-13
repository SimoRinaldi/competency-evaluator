import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BestSubCompetencyScoreEntity } from './entities/best-subcompetency-score.entity';
import { CreateBestSubCompetencyScoreDto } from './dto/create-best-subcompetency-score.dto';
import { UpdateBestSubCompetencyScoreDto } from './dto/update-best-subcompetency-score.dto';

@Injectable()
export class ServerBestSubCompetencyScoresRepository {
    constructor(
        @InjectRepository(BestSubCompetencyScoreEntity)
        private readonly repository: Repository<BestSubCompetencyScoreEntity>) {}

    async createOne(dto: CreateBestSubCompetencyScoreDto): Promise<BestSubCompetencyScoreEntity> {
        const bscs = this.repository.create({
            best_score_absolute: dto.best_score_absolute,
            best_score_percentage: dto.best_score_percentage,
            user_id: dto.user_id,
            subcompetency_id: dto.subcompetency_id
        });

        return this.repository.save(bscs);
    }

    async findAll(): Promise<BestSubCompetencyScoreEntity[]> {
        return this.repository.find({
            order: { id: 'ASC' },
            relations: ['user', 'subcompetency']
        });   
    }

    async findById(id: number): Promise<BestSubCompetencyScoreEntity | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['user', 'subcompetency']
        });
    }

    async findByUserAndSubCompetency(
        user_id: number, 
        subcompetency_id: number
    ): Promise<BestSubCompetencyScoreEntity | null> {
        return this.repository.findOneBy({
            user_id,
            subcompetency_id
        });
    }

    async updateOne(bscs: BestSubCompetencyScoreEntity, dto: UpdateBestSubCompetencyScoreDto): Promise<BestSubCompetencyScoreEntity> {
        if (dto.best_score_absolute !== undefined) bscs.best_score_absolute = dto.best_score_absolute
        if (dto.best_score_percentage !== undefined) bscs.best_score_percentage = dto.best_score_percentage;
        if (dto.user_id !== undefined) bscs.user_id = dto.user_id;
        if (dto.subcompetency_id !== undefined) bscs.subcompetency_id = dto.subcompetency_id;

        return this.repository.save(bscs);
    }
    
    async deleteOne(id: number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return (result.affected ?? 0) > 0;
    }
}
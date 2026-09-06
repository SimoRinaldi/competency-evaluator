import { PartialType } from '@nestjs/swagger';
import { CreateBestCompetencyScoreDto } from './create-best-competency-score.dto';

export class UpdateBestCompetencyScoreDto extends PartialType(CreateBestCompetencyScoreDto) {}

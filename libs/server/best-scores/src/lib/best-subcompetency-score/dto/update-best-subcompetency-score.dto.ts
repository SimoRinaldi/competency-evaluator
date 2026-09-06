import { PartialType } from '@nestjs/swagger';
import { CreateBestSubCompetencyScoreDto } from './create-best-subcompetency-score.dto';

export class UpdateBestSubCompetencyScoreDto extends PartialType(CreateBestSubCompetencyScoreDto) {}

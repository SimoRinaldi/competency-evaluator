import { PartialType } from '@nestjs/swagger';
import { CreateSubCompetencyHistoricalScoreDto } from './create-subcompetency-historical-score.dto';

export class UpdateSubCompetencyHistoricalScoreDto extends PartialType(
  CreateSubCompetencyHistoricalScoreDto
) {}

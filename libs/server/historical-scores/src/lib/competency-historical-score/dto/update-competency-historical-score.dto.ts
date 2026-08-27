import { PartialType } from '@nestjs/swagger';
import { CreateCompetencyHistoricalScoreDto } from './create-competency-historical-score.dto';

export class UpdateCompetencyHistoricalScoreDto extends PartialType(
  CreateCompetencyHistoricalScoreDto
) {}

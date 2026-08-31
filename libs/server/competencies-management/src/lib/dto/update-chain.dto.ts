import { PartialType } from '@nestjs/swagger';
import { CreateCompetencyChainDto } from './create-chain.dto';

export class UpdateCompetencyChainDto extends PartialType(CreateCompetencyChainDto) {}

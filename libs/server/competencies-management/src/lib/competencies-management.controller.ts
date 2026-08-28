import { Controller, Post, Body } from '@nestjs/common';
import { CompetenciesManagementService } from './competencies-management.service';
import { CreateCompetencyChainDto } from './dto/create-chain.dto';

@Controller('competencies-management')
export class CompetenciesManagementController {
  constructor(
    private readonly competenciesManagementService: CompetenciesManagementService
  ) {}

  @Post('chain')
  async createChain(@Body() dto: CreateCompetencyChainDto) {
    return this.competenciesManagementService.handleCreateCompetencyChain(dto);
  }
}

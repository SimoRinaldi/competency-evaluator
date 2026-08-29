import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { CompetenciesManagementService } from './competencies-management.service';
import { CreateCompetencyChainDto } from './dto/create-chain.dto';

@Controller('competencies_management')
export class CompetenciesManagementController {
  constructor(
    private readonly competenciesManagementService: CompetenciesManagementService
  ) {}

  @Post('chain')
  async createChain(@Body(ValidationPipe) dto: CreateCompetencyChainDto) {
    return this.competenciesManagementService.handleCreateCompetencyChain(dto);
  }
}

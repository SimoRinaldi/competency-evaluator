import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard } from '@server/security';
import { UserRole } from '@server/users';
import { CompetenciesManagementService } from './competencies-management.service';
import { CreateCompetencyChainDto } from './dto/create-chain.dto';

@ApiTags('Competencies Management APIs')
@Controller('competencies_management')
export class CompetenciesManagementController {
  constructor(
    private readonly competenciesManagementService: CompetenciesManagementService
  ) {}

  @Post('chain')
//  @UseGuards(JwtAuthGuard, RolesGuard)
//  @Roles(UserRole.ADMIN)
//  @ApiBearerAuth()
  @ApiBody({ type: CreateCompetencyChainDto })
  @ApiOperation({
    summary:
      'Crea a cascata una catena completa di competenze, sotto-competenze, oggetti di osservazione, indicatori e rubriche',
  })
  @ApiResponse({
    status: 201,
    description: 'Catena creata con successo in una singola transazione',
  })
  @ApiBadRequestResponse({
    description:
      'Dati forniti non validi, array vuoti o struttura della catena incompleta',
  })
  @ApiNotFoundResponse({
    description:
      'Risorsa collegata non trovata (tool, method, skill o rubric_set_id inesistente)',
  })
  @ApiConflictResponse({
    description:
      'Conflitto: titolo della competenza o della sotto-competenza già presente a sistema',
  })
  @ApiInternalServerErrorResponse({
    description:
      'Errore interno del server durante il salvataggio o il rollback della transazione',
  })
  async createChain(@Body(ValidationPipe) dto: CreateCompetencyChainDto) {
    return this.competenciesManagementService.handleCreateCompetencyChain(dto);
  }
}

import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard } from '@server/security';
import { UserRole } from '@server/users';
import { HistoricalScoresService } from './historical-scores.service';
import { UserCompetencyEvaluationDto } from './competency-historical-score/dto/user-competency-evaluation.dto';
import { UserSubCompetencyEvaluationDto } from './subcompetency-historical-score/dto/user-subcompetency-evaluation.dto';

@ApiTags('Historical Scores APIs')
@Controller('historical_scores')
export class HistoricalScoresController {
  constructor(
    private readonly historicalScoresService: HistoricalScoresService
  ) {}

  @Get('competencies/acquired/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Recupera le competenze superate da un utente' })
  @ApiResponse({ status: 200, type: [UserCompetencyEvaluationDto] })
  findAcquiredCompetencies(
    @Param('userId', ParseIntPipe) userId: number
  ): Promise<UserCompetencyEvaluationDto[]> {
    return this.historicalScoresService.findAcquiredCompetencies(userId);
  }

  @Get('competencies/unacquired/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Recupera le competenze non superate o mai affrontate da un utente',
  })
  @ApiResponse({ status: 200, type: [UserCompetencyEvaluationDto] })
  findUnacquiredCompetencies(
    @Param('userId', ParseIntPipe) userId: number
  ): Promise<UserCompetencyEvaluationDto[]> {
    return this.historicalScoresService.findUnacquiredCompetencies(userId);
  }

  @Get('subcompetencies/acquired/:userId/:competencyId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Recupera le sotto-competenze superate da un utente per una specifica competenza',
  })
  @ApiResponse({ status: 200, type: [UserSubCompetencyEvaluationDto] })
  findAcquiredSubCompetencies(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('competencyId', ParseIntPipe) competencyId: number
  ): Promise<UserSubCompetencyEvaluationDto[]> {
    return this.historicalScoresService.findAcquiredSubCompetencies(
      userId,
      competencyId
    );
  }

  @Get('subcompetencies/unacquired/:userId/:competencyId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Recupera le sotto-competenze non superate o mai affrontate da un utente per una specifica competenza',
  })
  @ApiResponse({ status: 200, type: [UserSubCompetencyEvaluationDto] })
  findUnacquiredSubCompetencies(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('competencyId', ParseIntPipe) competencyId: number
  ): Promise<UserSubCompetencyEvaluationDto[]> {
    return this.historicalScoresService.findUnacquiredSubCompetencies(
      userId,
      competencyId
    );
  }
}

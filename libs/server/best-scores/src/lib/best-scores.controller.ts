import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard } from '@server/security';
import { UserRole } from '@server/users';
import { BestScoresService } from './best-scores.service';
import { UserCompetencyEvaluationDto } from './best-competency-score/dto/user-competency-evaluation.dto';
import { UserSubCompetencyEvaluationDto } from './best-subcompetency-score/dto/user-subcompetency-evaluation.dto';

@ApiTags('Best Scores APIs')
@Controller('best_scores')
export class BestScoresController {
  constructor(private readonly bestScoresService: BestScoresService) {}

  @Get('competencies/acquired/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Recupera le competenze superate da un utente' })
  @ApiResponse({ status: 200, type: [UserCompetencyEvaluationDto] })
  findAcquiredCompetencies(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<UserCompetencyEvaluationDto[]> {
    return this.bestScoresService.findAcquiredCompetencies(userId);
  }

  @Get('competencies/unacquired/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Recupera le competenze non superate o mai affrontate da un utente',
  })
  @ApiResponse({ status: 200, type: [UserCompetencyEvaluationDto] })
  findUnacquiredCompetencies(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<UserCompetencyEvaluationDto[]> {
    return this.bestScoresService.findUnacquiredCompetencies(userId);
  }

  @Get('subcompetencies/acquired/:userId/:competencyId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Recupera le sotto-competenze superate da un utente per una specifica competenza',
  })
  @ApiResponse({ status: 200, type: [UserSubCompetencyEvaluationDto] })
  findAcquiredSubCompetencies(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('competencyId', ParseIntPipe) competencyId: number,
  ): Promise<UserSubCompetencyEvaluationDto[]> {
    return this.bestScoresService.findAcquiredSubCompetencies(userId, competencyId);
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
    @Param('competencyId', ParseIntPipe) competencyId: number,
  ): Promise<UserSubCompetencyEvaluationDto[]> {
    return this.bestScoresService.findUnacquiredSubCompetencies(userId, competencyId);
  }
}

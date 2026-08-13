import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, Delete, UseGuards, ValidationPipe } from '@nestjs/common';
import { ServerBestCompetencyScoresService } from './best-competency-score.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard } from '@server/security';
import { CreateBestCompetencyScoreDto } from './dto/create-best-competency-score.dto';
import { UpdateBestCompetencyScoreDto } from './dto/update-best-competency-score.dto';
import { UserRole } from '@server/users';

@ApiTags('BestCompetencyScores API')
@Controller('best_competency_scores')
export class ServerBestCompetencyScoreController {
  constructor( private readonly serverBestCompetencyScoresService: ServerBestCompetencyScoresService ) {}

  // decoratori di swagger

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  create(@Body(ValidationPipe) createBestCompetencyScore: CreateBestCompetencyScoreDto) {
    return this.serverBestCompetencyScoresService.create(createBestCompetencyScore);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  findAll() {
    return this.serverBestCompetencyScoresService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serverBestCompetencyScoresService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  update(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) updateBestCompetencyScoreDto: UpdateBestCompetencyScoreDto) {
    return this.serverBestCompetencyScoresService.update(id, updateBestCompetencyScoreDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.serverBestCompetencyScoresService.remove(id);
  }
}
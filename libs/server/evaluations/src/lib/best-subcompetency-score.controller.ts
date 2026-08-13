import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, Delete, UseGuards, ValidationPipe } from '@nestjs/common';
import { ServerBestSubCompetencyScoresService } from './best-subcompetency-score.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard } from '@server/security';
import { CreateBestSubCompetencyScoreDto } from './dto/create-best-subcompetency-score.dto';
import { UpdateBestSubCompetencyScoreDto } from './dto/update-best-subcompetency-score.dto';
import { UserRole } from '@server/users';

@ApiTags('BestSubCompetencyScores API')
@Controller('best_subcompetency_scores')
export class ServerBestSubCompetencyScoreController {
  constructor( private readonly serverBestSubCompetencyScoresService: ServerBestSubCompetencyScoresService ) {}

  // decoratori di swagger

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  create(@Body(ValidationPipe) createBestSubCompetencyScore: CreateBestSubCompetencyScoreDto) {
    return this.serverBestSubCompetencyScoresService.create(createBestSubCompetencyScore);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  findAll() {
    return this.serverBestSubCompetencyScoresService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serverBestSubCompetencyScoresService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  update(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) updateBestSubCompetencyScoreDto: UpdateBestSubCompetencyScoreDto) {
    return this.serverBestSubCompetencyScoresService.update(id, updateBestSubCompetencyScoreDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.serverBestSubCompetencyScoresService.remove(id);
  }
}
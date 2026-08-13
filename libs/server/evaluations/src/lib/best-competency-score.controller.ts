import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, Delete, UseGuards, ValidationPipe } from '@nestjs/common';
import { ServerBestCompetencyScoresService } from './best-competency-score.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateBestCompetencyScoreDto } from './dto/create-best-competency-score.dto';
import { UpdateBestCompetencyScoreDto } from './dto/update-best-competency-score.dto';

@ApiTags('BestCompetencyScores API')
@Controller('best_competency_scores')
export class ServerBestCompetencyScoreController {
  constructor( private readonly serverBestCompetencyScoresService: ServerBestCompetencyScoresService ) {}

  // guardie, roles e decoratori di swagger

  @Post()
  create(@Body(ValidationPipe) createBestCompetencyScore: CreateBestCompetencyScoreDto) {
    return this.serverBestCompetencyScoresService.create(createBestCompetencyScore);
  }

  @Get()
  findAll() {
    return this.serverBestCompetencyScoresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serverBestCompetencyScoresService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) updateBestCompetencyScoreDto: UpdateBestCompetencyScoreDto) {
    return this.serverBestCompetencyScoresService.update(id, updateBestCompetencyScoreDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.serverBestCompetencyScoresService.delete(id);
  }
}
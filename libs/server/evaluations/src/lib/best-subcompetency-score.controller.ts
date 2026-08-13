import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, Delete, UseGuards, ValidationPipe } from '@nestjs/common';
import { ServerBestSubCompetencyScoresService } from './best-subcompetency-score.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateBestSubCompetencyScoreDto } from './dto/create-best-subcompetency-score.dto';
import { UpdateBestSubCompetencyScoreDto } from './dto/update-best-subcompetency-score.dto';

@ApiTags('BestSubCompetencyScores API')
@Controller('best_subcompetency_scores')
export class ServerBestSubCompetencyScoreController {
  constructor( private readonly serverBestSubCompetencyScoresService: ServerBestSubCompetencyScoresService ) {}

  // guardie, roles e decoratori di swagger

  @Post()
  create(@Body(ValidationPipe) createBestSubCompetencyScore: CreateBestSubCompetencyScoreDto) {
    return this.serverBestSubCompetencyScoresService.create(createBestSubCompetencyScore);
  }

  @Get()
  findAll() {
    return this.serverBestSubCompetencyScoresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serverBestSubCompetencyScoresService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) updateBestSubCompetencyScoreDto: UpdateBestSubCompetencyScoreDto) {
    return this.serverBestSubCompetencyScoresService.update(id, updateBestSubCompetencyScoreDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.serverBestSubCompetencyScoresService.delete(id);
  }
}
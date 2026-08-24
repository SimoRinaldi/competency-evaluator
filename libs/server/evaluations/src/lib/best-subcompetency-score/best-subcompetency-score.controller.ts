import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard } from '@server/security';
import { UserRole } from '@server/users';
import { BestSubCompetencyScoreService } from './best-subcompetency-score.service';
import { CreateBestSubCompetencyScoreDto } from './dto/create-best-subcompetency-score.dto';
import { UpdateBestSubCompetencyScoreDto } from './dto/update-best-subcompetency-score.dto';

@ApiTags('Best SubCompetency Scores APIs')
@Controller('best_subcompetency_scores')
export class BestSubCompetencyScoreController {
  constructor(
    private readonly bestSubCompetencyScoreService: BestSubCompetencyScoreService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  create(
    @Body(ValidationPipe)
    createBestSubCompetencyScore: CreateBestSubCompetencyScoreDto
  ) {
    return this.bestSubCompetencyScoreService.create(
      createBestSubCompetencyScore
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  findAll() {
    return this.bestSubCompetencyScoreService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bestSubCompetencyScoreService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe)
    updateBestSubCompetencyScoreDto: UpdateBestSubCompetencyScoreDto
  ) {
    return this.bestSubCompetencyScoreService.update(
      id,
      updateBestSubCompetencyScoreDto
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bestSubCompetencyScoreService.remove(id);
  }
}

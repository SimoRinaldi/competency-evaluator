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
import { BestCompetencyScoreService } from './best-competency-score.service';
import { CreateBestCompetencyScoreDto } from './dto/create-best-competency-score.dto';
import { UpdateBestCompetencyScoreDto } from './dto/update-best-competency-score.dto';

@ApiTags('BestCompetencyScores APIs')
@Controller('best_competency_score')
export class BestCompetencyScoreController {
  constructor(private readonly service: BestCompetencyScoreService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  create(
    @Body(ValidationPipe)
    dto: CreateBestCompetencyScoreDto,
  ) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Get('by-user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiBearerAuth()
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.service.findByUser(userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe)
    dto: UpdateBestCompetencyScoreDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}

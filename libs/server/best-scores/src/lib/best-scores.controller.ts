import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard } from '@server/security';
import { UserRole } from '@server/users';
import { BestScoresService } from './best-scores.service';
import { BestScoresDto } from './dto/best-scores.dto';

@ApiTags('Best Scores APIs')
@Controller('best_scores')
export class BestScoresController {
  constructor(private readonly bestScoresService: BestScoresService) {}

  @Get(':userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Recupera gli score dell\'utente' })
  @ApiResponse({ status: 200, type: BestScoresDto })
  async findBestScores(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<BestScoresDto> {
    return this.bestScoresService.getBestScores(userId);
  }
}

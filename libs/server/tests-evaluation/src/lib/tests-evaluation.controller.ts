import { Controller, Post, Get, Param, ParseIntPipe, Body, UseGuards, ValidationPipe, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard } from '@server/security';
import { UserRole } from '@server/users';
import { TestsEvaluationService } from './tests-evaluation.service';
import { SubmitEvaluationDto } from './dto/submit-evaluation.dto';

@ApiTags('Tests Evaluation APIs')
@Controller('tests_evaluation')
export class TestsEvaluationController {
  constructor(private readonly testsEvaluationService: TestsEvaluationService) {}

  @Post('evaluate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EVALUATOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Invia la valutazione batch per una test execution, valida i rank e ricalcola i punteggi',
  })
  @ApiResponse({
    status: 201,
    description: 'Valutazione salvata e punteggi ricalcolati con successo',
  })
  async evaluate(
    @Body(ValidationPipe) dto: SubmitEvaluationDto,
    @Req() req: { user?: { id?: number } },
  ) {
    const cureent_user_id = req?.user?.id;
    return this.testsEvaluationService.submitEvaluation(dto, cureent_user_id);
  }

  @Get('evaluator-status/:testId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EVALUATOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Ritorna lo stato di valutazione (se valutato dal valutatore corrente) per tutte le esecuzioni di un test',
  })
  async getEvaluatorStatus(
    @Param('testId', ParseIntPipe) testId: number,
    @Req() req: { user?: { id?: number } },
  ) {
    const current_user_id = req?.user?.id;
    if (!current_user_id) throw new Error('User ID not found');
    return this.testsEvaluationService.getEvaluatorStatus(testId, current_user_id);
  }

  @Get('evaluations/:executionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EVALUATOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Ritorna le valutazioni espresse dal valutatore corrente per una data esecuzione',
  })
  async getEvaluationsForExecution(
    @Param('executionId', ParseIntPipe) executionId: number,
    @Req() req: { user?: { id?: number } },
  ) {
    const current_user_id = req?.user?.id;
    if (!current_user_id) throw new Error('User ID not found');
    return this.testsEvaluationService.getEvaluationsForExecution(executionId, current_user_id);
  }
}

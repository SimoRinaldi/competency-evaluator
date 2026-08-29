import {
  Controller,
  Post,
  Body,
  UseGuards,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard } from '@server/security';
import { UserRole } from '@server/users';
import { TestsEvaluationService } from './tests-evaluation.service';
import { SubmitEvaluationDto } from './dto/submit-evaluation.dto';

@ApiTags('Tests Evaluation APIs')
@Controller('tests_evaluation')
export class TestsEvaluationController {
  constructor(
    private readonly testsEvaluationService: TestsEvaluationService
  ) {}

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
    @Req() req: { user?: { id?: number } }
  ) {
    const currentUserId = req?.user?.id;
    return this.testsEvaluationService.submitEvaluation(dto, currentUserId);
  }
}

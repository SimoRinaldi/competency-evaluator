import { Controller } from '@nestjs/common';
import { ServerEvaluationsService } from './evaluations.service';

@Controller('evaluations')
export class ServerEvaluationsController {
  constructor(private serverEvaluationsService: ServerEvaluationsService) {}
}

import { Controller } from '@nestjs/common';
import { ServerRubricsService } from './rubrics.service';

@Controller('rubrics')
export class ServerRubricsController {
  constructor(private serverRubricsService: ServerRubricsService) {}
}

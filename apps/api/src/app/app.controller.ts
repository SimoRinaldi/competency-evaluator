import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Example of API')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('data')
  getData() {
    return this.appService.getData();
  }
}

import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ServerRubricsService } from './rubrics.service';
import { CreateRubricSetDto } from './dto/create-rubric.dto'

@Controller('rubrics')
export class ServerRubricsController {

  constructor(private readonly serverRubricsService: ServerRubricsService) {}

  @Post()
  create(@Body() createRubricSetDto: CreateRubricSetDto) {
    return this.serverRubricsService.create(createRubricSetDto);
  }

  @Get()                                                                                                                                                                     
  findAll() {                                                                                                                                                                
    return this.serverRubricsService.findAll();                                                                                                                                    
  }                                                                                                                                                                          
                                                                                                                                                                                                                                                                                     
  @Get(':id')                                                                                                                                                                
  findOne(@Param('id', ParseIntPipe) id: number) {                                                                                                                                                                                                                                                             
    return this.serverRubricsService.findOne(id);                                                                                                                                  
  }                                                                                                                                                                          
}  
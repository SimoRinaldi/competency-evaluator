import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MethodService } from './method.service';
import { CreateMethodDto } from './dto/create-method.dto';
import { UpdateMethodDto } from './dto/update-method.dto';

@Controller('method')
export class MethodController {
  constructor(private readonly methodService: MethodService) {}

  @Post()
  create(@Body() createMethodDto: CreateMethodDto) {
    return this.methodService.create(createMethodDto);
  }

  @Get()
  findAll() {
    return this.methodService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.methodService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMethodDto: UpdateMethodDto) {
    return this.methodService.update(+id, updateMethodDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.methodService.remove(+id);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ParseIntPipe,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard } from '@server/security';
import { UserRole } from '@server/users';
import { MethodService } from './method.service';
import { CreateMethodDto } from './dto/create-method.dto';
import { UpdateMethodDto } from './dto/update-method.dto';

@ApiTags('Methods APIs')
@Controller('methods')
export class MethodController {
  constructor(private readonly methodService: MethodService) {}

  @Get() // GET /methods
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  getMethods() {
    return this.methodService.getMethods();
  }

  @Get(':id') // GET /methods/:id
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  getOneMethod(@Param('id', ParseIntPipe) id: number) {
    return this.methodService.getOneMethod(id);
  }

  @Post() // POST /methods
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  create(@Body(ValidationPipe) method: CreateMethodDto) {
    return this.methodService.create(method);
  }

  @Patch(':id') // PATCH /methods/:id
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) methodUpdate: UpdateMethodDto
  ) {
    return this.methodService.update(id, methodUpdate);
  }

  @Delete(':id') // DELETE /methods/:id
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  removeMethod(@Param('id', ParseIntPipe) id: number) {
    return this.methodService.removeMethod(id);
  }
}

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
import { SubCompetencyService } from './subcompetency.service';
import { CreateSubCompetencyDto } from './dto/create-subcompetency.dto';
import { UpdateSubCompetencyDto } from './dto/update-subcompetency.dto';

@ApiTags('SubCompetencies APIs')
@Controller('subcompetencies')
export class SubCompetencyController {
  constructor(
    private readonly subCompetencyService: SubCompetencyService
  ) {}

  @Get() // GET /subcompetencies
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  getSubCompetencies() {
    return this.subCompetencyService.getSubCompetencies();
  }

  @Get(':id') // GET /subcompetencies/:id
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  getOneSubCompetency(@Param('id', ParseIntPipe) id: number) {
    return this.subCompetencyService.getOneSubCompetency(id);
  }

  @Post() // POST /subcompetencies
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  create(@Body(ValidationPipe) subCompetency: CreateSubCompetencyDto) {
    return this.subCompetencyService.create(subCompetency);
  }

  @Patch(':id') // PATCH /subcompetencies/:id
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) subCompetencyUpdate: UpdateSubCompetencyDto
  ) {
    return this.subCompetencyService.update(id, subCompetencyUpdate);
  }

  @Delete(':id') // DELETE /subcompetencies/:id
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  removeSubCompetency(@Param('id', ParseIntPipe) id: number) {
    return this.subCompetencyService.removeSubCompetency(id);
  }
}

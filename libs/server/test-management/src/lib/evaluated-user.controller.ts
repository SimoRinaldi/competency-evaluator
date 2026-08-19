import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard } from '@server/security';
import { UserRole } from '@server/users';
import { ServerEvaluatedUsersService } from './evaluated-user.service';
import { CreateEvaluatedUserDto } from './dto/create-evaluated-user.dto';
import { UpdateEvaluatedUserDto } from './dto/update-evaluated-user.dto';

@ApiTags('EvaluatedUsers API')
@Controller('evaluated_users')
export class ServerEvaluatedUserController {
  constructor(
    private readonly serverEvaluatedUsersService: ServerEvaluatedUsersService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  create(
    @Body(ValidationPipe) createEvaluatedUserDto: CreateEvaluatedUserDto
  ) {
    return this.serverEvaluatedUsersService.create(createEvaluatedUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER, UserRole.EVALUATOR, UserRole.USER)
  @ApiBearerAuth()
  findAll() {
    return this.serverEvaluatedUsersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER, UserRole.EVALUATOR, UserRole.USER)
  @ApiBearerAuth()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serverEvaluatedUsersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateEvaluatedUserDto: UpdateEvaluatedUserDto
  ) {
    return this.serverEvaluatedUsersService.update(
      id,
      updateEvaluatedUserDto
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.serverEvaluatedUsersService.remove(id);
  }
}

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
import { TestService } from './test.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';

@ApiTags('Tests APIs')
@Controller('tests')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  create(
    @Body(ValidationPipe)
    dto: CreateTestDto
  ) {
    return this.testService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.ADMIN,
    UserRole.TEST_DESIGNER,
    UserRole.EVALUATOR,
    UserRole.USER
  )
  @ApiBearerAuth()
  findAll() {
    return this.testService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.ADMIN,
    UserRole.TEST_DESIGNER,
    UserRole.EVALUATOR,
    UserRole.USER
  )
  @ApiBearerAuth()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.testService.findOne(id);
  }

  @Get('by-designer/:designerId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.ADMIN,
    UserRole.TEST_DESIGNER,
    UserRole.EVALUATOR,
    UserRole.USER
  )
  @ApiBearerAuth()
  findByDesigner(@Param('designerId', ParseIntPipe) designerId: number) {
    return this.testService.findByTestDesigner(designerId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe)
    dto: UpdateTestDto
  ) {
    return this.testService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.testService.remove(id);
  }
}

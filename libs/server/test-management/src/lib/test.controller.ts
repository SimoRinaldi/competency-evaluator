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
import { ServerTestsService } from './test.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';

@ApiTags('Tests API')
@Controller('tests')
export class ServerTestController {
  constructor(private readonly serverTestsService: ServerTestsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  create(@Body(ValidationPipe) createTestDto: CreateTestDto) {
    return this.serverTestsService.create(createTestDto);
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
    return this.serverTestsService.findAll();
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
    return this.serverTestsService.findOne(id);
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
    return this.serverTestsService.findByTestDesigner(designerId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateTestDto: UpdateTestDto
  ) {
    return this.serverTestsService.update(id, updateTestDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.serverTestsService.remove(id);
  }
}

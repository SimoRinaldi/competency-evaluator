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
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard, CurrentUser } from '@server/security';
import { UserEntity, UserRole } from '@server/users';
import { TestService } from './test.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { TestDesignerService } from '../test-designer/test-designer.service';

@ApiTags('Tests APIs')
@Controller('tests')
export class TestController {
  constructor(
    private readonly testService: TestService,
    private readonly testDesignerService: TestDesignerService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  async create(@CurrentUser() user: UserEntity, @Body(ValidationPipe) dto: CreateTestDto) {
    if (user.role === UserRole.TEST_DESIGNER) {
      const designer = await this.testDesignerService.findByUserId(user.id);
      if (!designer) {
        throw new ForbiddenException('Il tuo utente non è associato ad alcun Test Designer.');
      }
      dto.test_designer_id = designer.id;
    }

    return this.testService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER, UserRole.EVALUATOR, UserRole.USER)
  @ApiBearerAuth()
  async findAll(@CurrentUser() user: UserEntity) {
    // Se è un TestDesigner vengono filtrati i test
    if (user.role === UserRole.TEST_DESIGNER) {
      const designer = await this.testDesignerService.findByUserId(user.id);
      if (!designer) return [];

      return this.testService.findByTestDesigner(designer.id);
    }
    return this.testService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER, UserRole.EVALUATOR, UserRole.USER)
  @ApiBearerAuth()
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.testService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe)
    dto: UpdateTestDto,
  ) {
    return this.testService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.testService.remove(id);
  }
}

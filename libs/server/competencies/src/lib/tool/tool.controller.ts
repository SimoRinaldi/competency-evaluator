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
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard } from '@server/security';
import { UserRole } from '@server/users';
import { ToolService } from './tool.service';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';

@ApiTags('Tools APIs')
@Controller('tools')
export class ToolController {
  constructor(private readonly toolService: ToolService) {}

  @Get() // GET /tools
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  getTools() {
    return this.toolService.getTools();
  }

  @Get(':id') // GET /tools/:id
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  getOneTool(@Param('id', ParseIntPipe) id: number) {
    return this.toolService.getOneTool(id);
  }

  @Post() // POST /tools
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Git' },
      },
      required: ['name'],
    },
  })
  create(@Body(ValidationPipe) tool: CreateToolDto) {
    return this.toolService.create(tool);
  }

  @Patch(':id') // PATCH /tools/:id
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Git' },
      },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) toolUpdate: UpdateToolDto
  ) {
    return this.toolService.update(id, toolUpdate);
  }

  @Delete(':id') // DELETE /tools/:id
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  removeTool(@Param('id', ParseIntPipe) id: number) {
    return this.toolService.removeTool(id);
  }
}

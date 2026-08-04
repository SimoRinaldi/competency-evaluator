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
import { SkillService } from './skill.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

@ApiTags('Skills APIs')
@Controller('skills')
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  @Get() // GET /skills
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  getSkills() {
    return this.skillService.getSkills();
  }

  @Get(':id') // GET /skills/:id
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  getOneSkill(@Param('id', ParseIntPipe) id: number) {
    return this.skillService.getOneSkill(id);
  }

  @Post() // POST /skills
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: '' },
      },
      required: ['name'],
    },
  })
  create(@Body(ValidationPipe) skill: CreateSkillDto) {
    return this.skillService.create(skill);
  }

  @Patch(':id') // PATCH /skills/:id
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: '' },
      },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) skillUpdate: UpdateSkillDto
  ) {
    return this.skillService.update(id, skillUpdate);
  }

  @Delete(':id') // DELETE /skills/:id
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  removeSkill(@Param('id', ParseIntPipe) id: number) {
    return this.skillService.removeSkill(id);
  }
}

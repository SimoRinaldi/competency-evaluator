import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSkillDto {
  @ApiProperty({ description: 'Nome della skill', example: 'Mediazione' })
  @IsString()
  @IsNotEmpty()
  name!: string;
}

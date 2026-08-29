import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateToolDto {
  @ApiProperty({
    required: true,
    description: 'Nome dello strumento',
    example: 'VS Code',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;
}

import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompetencyDto {
  @ApiProperty({ description: 'Titolo della competenza', example: 'Definire l\'idea progettuale' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'Peso o importanza della competenza', example: 5 })
  @IsNumber()
  @IsNotEmpty()
  weight!: number;
}

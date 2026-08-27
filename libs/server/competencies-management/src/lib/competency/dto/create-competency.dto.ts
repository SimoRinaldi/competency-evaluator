import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompetencyDto {
  @ApiProperty({
    description: 'Titolo della competenza',
    example: "Definire l'idea progettuale",
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: 'Peso o importanza della competenza (da 1 a 5)',
    example: 5,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  weight!: number;
}

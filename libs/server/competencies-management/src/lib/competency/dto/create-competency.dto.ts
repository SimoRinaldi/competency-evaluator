import {
  IsNotEmpty,
  IsInt,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompetencyDto {
  @ApiProperty({
    description: 'Titolo della competenza',
    example: "Definire l'idea progettuale",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: 'Peso o importanza della competenza (da 1 a 5)',
    example: 5,
    required: true,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  weight!: number;

  @ApiProperty({
    description: 'Soglia di acquisizione della competenza',
    example: '30',
    required: true,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  threshold!: number;
}

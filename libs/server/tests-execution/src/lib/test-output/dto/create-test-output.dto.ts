import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTestOutputDto {
  @ApiProperty({
    required: true,
    description: "Nome dell'elaborato o materiale prodotto durante il test",
    example: 'Relazione del progetto',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    description: "Descrizione dell'elaborato prodotto",
    example: 'Documento PDF contenente la descrizione tecnica.',
    type: String,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: "URL di accesso o download dell'elaborato",
    example: 'https://storage.example.com/outputs/relazione.pdf',
    type: String,
  })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiProperty({
    required: true,
    description: "ID dell'esecuzione del test a cui appartiene l'elaborato",
    example: 1,
    type: Number,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  test_execution_id!: number;

  @ApiPropertyOptional({
    description: "Versione dell'elaborato prodotto",
    example: '1.0.0',
    type: String,
  })
  @IsString()
  @IsOptional()
  version?: string;
}

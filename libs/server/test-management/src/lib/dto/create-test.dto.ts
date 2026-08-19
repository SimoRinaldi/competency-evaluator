import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateTestDto {
  @ApiProperty({
    description:
      'Descrizione del contesto e della situazione di valutazione del test',
    example: 'Assessment di laboratorio sulle architetture software ad eventi.',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  assessment_situation!: string;

  @ApiProperty({
    description: 'ID del Test Designer responsabile della creazione del test',
    example: 1,
    type: Number,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  test_designer_id!: number;
}

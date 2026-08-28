import { IsInt, IsString, Min, Max, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIndicatorDto {
  @ApiProperty({ example: "Chiarezza dell'esposizione", required: true })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    example: 5,
    description: "Peso dell'indicatore (da 1 a 5)",
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  weight!: number;

  @ApiProperty({
    example: 1,
    description: 'ID del set di rubriche associato',
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  rubric_set_id!: number;

  @ApiProperty({
    example: 42,
    description: "ID dell'oggetto di osservazione associato",
    required: true,
  })
  @IsInt()
  @IsNotEmpty()
  observation_object_id!: number;
}

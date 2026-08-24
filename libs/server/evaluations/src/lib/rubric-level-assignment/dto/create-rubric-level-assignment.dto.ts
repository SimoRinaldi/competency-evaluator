import { IsInt, Min, Max, IsNotEmpty, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRubricLevelAssignmentDto {
  @ApiProperty({
    description: 'Valore del livello assegnato (da 1 a 5, oppure 1 o 5 per valutazione binaria)',
    example: 4,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  rubric_rank!: number;

  @ApiProperty({
    description: 'ID dell indicatore valutato',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  indicator_id!: number;

  @ApiProperty({
    description: 'ID dell esecuzione del test',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  test_execution_id!: number;

  @ApiProperty({
    description: 'ID del valutatore',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  evaluator_id!: number;
}

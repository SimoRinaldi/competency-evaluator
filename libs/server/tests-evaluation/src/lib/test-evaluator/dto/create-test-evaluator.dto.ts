import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateTestEvaluatorDto {
  @ApiProperty({
    example: 1,
    description: "ID dell'utente associato come Test Evaluator",
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  user_id!: number;
}

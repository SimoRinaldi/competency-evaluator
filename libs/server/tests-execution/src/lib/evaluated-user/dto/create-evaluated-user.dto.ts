import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateEvaluatedUserDto {
  @ApiProperty({
    required: true,
    example: 1,
    description: "ID dell'utente associato come Evaluated User",
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  user_id!: number;
}

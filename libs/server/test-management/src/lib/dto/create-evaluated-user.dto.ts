import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateEvaluatedUserDto {
  @ApiProperty({
    description: "ID dell'utente associato come Evaluated User",
    example: 2,
    type: Number,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  user_id!: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateTestDesignerDto {
  @ApiProperty({
    description: "ID dell'utente associato come Test Designer",
    example: 1,
    type: Number,

  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  user_id!: number;
}

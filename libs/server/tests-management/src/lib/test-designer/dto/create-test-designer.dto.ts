import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateTestDesignerDto {
  @ApiProperty({
    required: true,
    example: 1,
    description: "ID dell'utente associato come Test Designer",
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  user_id!: number;
}

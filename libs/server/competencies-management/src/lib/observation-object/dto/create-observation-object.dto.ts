import { IsNotEmpty, IsString, IsInt, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateObservationObjectDto {
  @ApiProperty({ example: 'Documento di sintesi PDF', required: true })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    example: 1,
    description: 'ID della sotto-competenza associata',
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  subcompetency_id!: number;
}

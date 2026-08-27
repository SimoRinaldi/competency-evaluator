import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMethodDto {
  @ApiProperty({ description: 'Nome del metodo', example: 'Usando il telefono' })
  @IsString()
  @IsNotEmpty()
  name!: string;
}

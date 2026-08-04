import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCompetencyDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsNumber()
  @IsNotEmpty()
  weight!: number;
}

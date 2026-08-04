import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSubCompetencyDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsNumber()
  @IsNotEmpty()
  weight!: number;

  @IsString()
  @IsOptional()
  input?: string;

  @IsString()
  @IsOptional()
  output?: string;

  @IsString()
  @IsOptional()
  action?: string;

  @IsNumber()
  @IsNotEmpty()
  competency_id!: number;
}

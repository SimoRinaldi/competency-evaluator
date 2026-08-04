import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMethodDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}

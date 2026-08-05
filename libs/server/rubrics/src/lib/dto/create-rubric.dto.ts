import { IsBoolean, IsString, IsInt, IsArray, ValidateNested, Min } from 'class-validator';                           
import { Type } from 'class-transformer'; 

export class CreateRubricLevelDto {
    @IsString()
    description: string;

    @IsInt()
    @Min(1) 
    rank: number;
}

export class CreateRubricSetDto {
    @IsBoolean()
    yes_no: boolean;

    @IsArray()
    @ValidateNested({each: true})
    @Type(() => CreateRubricLevelDto)
    levels: CreateRubricLevelDto[];
}
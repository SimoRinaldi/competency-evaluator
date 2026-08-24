import { IsBoolean, IsString, IsInt, IsArray, ValidateNested, Min } from 'class-validator';                           
import { Type } from 'class-transformer'; 
import { ApiProperty } from '@nestjs/swagger';                                                                                                           

export class CreateRubricLevelDto {
    @ApiProperty({ example: 'Inadeguato', description: 'Testo che descrive questo livello' })
    @IsString()
    description!: string;

    @ApiProperty({ example: 1, description: 'Valore numerico (rango) del livello' })                                                                       
    @IsInt()
    @Min(1) 
    rank!: number;
}

export class CreateRubricSetDto {
    @ApiProperty({ example: false, description: 'True per valutazione binaria (Si/No), False per scala standard' })                                        
    @IsBoolean()
    yes_no!: boolean;

    @ApiProperty({ type: () => [CreateRubricLevelDto], description: 'Elenco dei livelli da creare insieme al set' })                                       
    @IsArray()
    @ValidateNested({each: true})
    @Type(() => CreateRubricLevelDto)
    levels?: CreateRubricLevelDto[];
}
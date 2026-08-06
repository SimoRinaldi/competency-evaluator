import { IsOptional, IsString } from 'class-validator';     
import { ApiProperty } from '@nestjs/swagger';                                                   
                                                                                                                          
export class CreateObservationObjectDto {      
    @ApiProperty({ example: 'Documento di sintesi PDF', required: false })
    @IsOptional()                                                                                                       
    @IsString()                                                                                                         
    description: string;                                                                                                                                                                                                                                                                                                                                                                                                     
}
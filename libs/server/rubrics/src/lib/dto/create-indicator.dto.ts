import { IsInt, IsString, Min, Max } from 'class-validator';   
import { ApiProperty } from '@nestjs/swagger';                                                   
                                                                                                                          
export class CreateIndicatorDto {   
    @ApiProperty({ example: "Chiarezza dell'esposizione" })                                                                                                                                                                                                     
    @IsString()                                                                                                         
    description: string;                                                                                               
              
    @ApiProperty({ example: 5, description: "Peso dell'indicatore (da 1 a 5)" })                                                                           
    @IsInt()                                                                                                            
    @Min(1)                                                                                                             
    @Max(5)                                                                                                             
    weight: number;                                                                                                    
              
    @ApiProperty({ example: 1, description: "ID del set di rubriche associato" })                                                                          
    @IsInt()                                                                                                            
    rubric_set_id: number;                                                                                             
                         
    @ApiProperty({ example: 42, description: "ID dell'oggetto di osservazione associato" })                                                                
    @IsInt()                                                                                                            
    observation_object_id: number;                                                                                     
}
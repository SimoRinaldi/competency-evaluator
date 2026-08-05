import { IsInt, IsString, Min, Max } from 'class-validator';                                                          
                                                                                                                          
export class CreateIndicatorDto {                                                                                                                                                                                                        
    @IsString()                                                                                                         
    description: string;                                                                                               
                                                                                                                                                                                                     
    @IsInt()                                                                                                            
    @Min(1)                                                                                                             
    @Max(5)                                                                                                             
    weight: number;                                                                                                    
                                                                                                                                                                                           
    @IsInt()                                                                                                            
    rubric_set_id: number;                                                                                             
                                                                                                                                                                                                  
    @IsInt()                                                                                                            
    observation_object_id: number;                                                                                     
}
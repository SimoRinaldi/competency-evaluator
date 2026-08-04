import { IsOptional, IsString } from 'class-validator';                                                        
                                                                                                                          
export class CreateObservationObjectDto {                                                                                                                                                                                                                                                                    
    @IsOptional()                                                                                                       
    @IsString()                                                                                                         
    description?: string;                                                                                                                                                                                                                                                                                                                                                                                                     
}
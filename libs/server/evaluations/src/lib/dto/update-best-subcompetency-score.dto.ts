import { CreateBestSubCompetencyScoreDto } from "./create-best-subcompetency-score.dto"; 
import { PartialType } from "@nestjs/mapped-types";

export class UpdateBestSubCompetencyScoreDto extends PartialType(CreateBestSubCompetencyScoreDto) {
    
}
import { CreateBestCompetencyScoreDto } from "./create-best-competency-score.dto"; 
import { PartialType } from "@nestjs/mapped-types";

export class UpdateBestCompetencyScoreDto extends PartialType(CreateBestCompetencyScoreDto) {
    
}
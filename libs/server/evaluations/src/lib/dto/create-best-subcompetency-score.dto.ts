import { IsInt, Min, IsNotEmpty, IsPositive, IsNumberString } from "class-validator";

export class CreateBestSubCompetencyScoreDto {
    @IsInt()
    @Min(0)
    @IsNotEmpty()
    best_score_absolute: number;

    @IsNumberString()
    @IsNotEmpty()
    best_score_percentage: string;

    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    user_id: number;

    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    subcompetency_id: number;
};
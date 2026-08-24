import { IsInt, Min, Max, IsNotEmpty, IsPositive } from "class-validator";

export class CreateRubricLevelAssignmentDto {
    @IsInt()
    @IsNotEmpty()
    @Min(1)
    @Max(5)
    rubric_rank!: number;

    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    indicator_id!: number;

    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    test_execution_id!: number;

    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    evaluator_id!: number;
};


import { IsInt, IsNotEmpty, IsPositive, IsArray } from "class-validator";

export class CreateTestEvaluatorDto {
    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    user_id: number;

    @IsArray()
    @IsInt({ each: true })
    @IsPositive({ each: true })
    // @IsOptional() usare in caso si voglia permettere di creare un valutatore senza assegnargli subito un test
    test_ids: number[];
};
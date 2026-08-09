import { CreateTestEvaluatorDto } from "./create-test-evaluator.dto"; 
import { PartialType } from "@nestjs/mapped-types";

export class UpdateTestEvaluatorDto extends PartialType(CreateTestEvaluatorDto) {
    
}
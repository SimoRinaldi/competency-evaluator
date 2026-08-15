import { CreateRubricLevelAssignmentDto } from "./create-rubric-level-assignment.dto"; 
import { PartialType } from "@nestjs/mapped-types";

export class UpdateRubricLevelAssignmentDto extends PartialType(CreateRubricLevelAssignmentDto) {
    
}
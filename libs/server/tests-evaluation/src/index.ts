export * from './lib/tests-evaluation.module';
export * from './lib/tests-evaluation.service';
export * from './lib/tests-evaluation.controller';
export * from './lib/dto/submit-evaluation.dto';

// Entità per relazioni esterne
export * from './lib/rubric-level-assignment/entities/rubric-level-assignment.entity';
export * from './lib/test-evaluator/entities/test-evaluator.entity';

// Servizi e sub-moduli esportati
export * from './lib/rubric-level-assignment/rubric-level-assignment.service';
export * from './lib/rubric-level-assignment/rubric-level-assignment.module';
export * from './lib/rubric-level-assignment/rubric-level-assignment.repository';

export * from './lib/test-evaluator/test-evaluator.service';
export * from './lib/test-evaluator/test-evaluator.module';
export * from './lib/test-evaluator/test-evaluator.repository';

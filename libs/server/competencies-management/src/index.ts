export * from './lib/competencies-management.module';

// Entità per relazioni
export * from './lib/competency/entities/competency.entity';
export * from './lib/subcompetency/entities/subcompetency.entity';
export * from './lib/skill/entities/skill.entity';
export * from './lib/tool/entities/tool.entity';
export * from './lib/method/entities/method.entity';
export * from './lib/rubric/entities/rubric-set.entity';
export * from './lib/rubric/entities/rubric-level.entity';
export * from './lib/observation-object/entities/observation-object.entity';
export * from './lib/indicator/entities/indicator.entity';

// Servizi e sub-moduli esportati per interoperabilità
export * from './lib/indicator/indicator.service';
export * from './lib/indicator/indicator.module';
export * from './lib/rubric/rubric.service';
export * from './lib/rubric/rubric.module';
export * from './lib/observation-object/observation-object.service';
export * from './lib/observation-object/observation-object.module';

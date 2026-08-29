export * from './lib/tests-management.module';

// Entità per relazioni TypeORM
export * from './lib/test/entities/test.entity';
export * from './lib/test-designer/entities/test-designer.entity';

// Servizi e sub-moduli per interoperabilità
export * from './lib/test/test.service';
export * from './lib/test/test.module';
export * from './lib/test/test.repository';

export * from './lib/test-designer/test-designer.service';
export * from './lib/test-designer/test-designer.module';
export * from './lib/test-designer/test-designer.repository';

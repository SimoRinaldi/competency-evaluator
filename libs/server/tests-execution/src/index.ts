export * from './lib/test-execution.module';

// Entità per relazioni TypeORM
export * from './lib/test-execution/entities/test-execution.entity';
export * from './lib/test-output/entities/test-output.entity';
export * from './lib/evaluated-user/entities/evaluated-user.entity';

// Servizi e sub-moduli esportati
export * from './lib/test-execution/test-execution.service';
export * from './lib/test-execution/test-execution.module';
export * from './lib/test-execution/test-execution.repository';

export * from './lib/test-output/test-output.service';
export * from './lib/test-output/test-output.module';
export * from './lib/test-output/test-output.repository';

export * from './lib/evaluated-user/evaluated-user.service';
export * from './lib/evaluated-user/evaluated-user.module';
export * from './lib/evaluated-user/evaluated-user.repository';

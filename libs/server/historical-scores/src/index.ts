export * from './lib/historical-scores.module';

// Entità per relazioni TypeORM
export * from './lib/competency-historical-score/entities/competency-historical-score.entity';
export * from './lib/subcompetency-historical-score/entities/subcompetency-historical-score.entity';

// Servizi e sub-moduli esportati
export * from './lib/competency-historical-score/competency-historical-score.service';
export * from './lib/competency-historical-score/competency-historical-score.module';
export * from './lib/competency-historical-score/competency-historical-score.repository';

export * from './lib/subcompetency-historical-score/subcompetency-historical-score.service';
export * from './lib/subcompetency-historical-score/subcompetency-historical-score.module';
export * from './lib/subcompetency-historical-score/subcompetency-historical-score.repository';

export * from './lib/historical-scores.service';
export * from './lib/historical-scores.controller';
export * from './lib/competency-historical-score/dto/user-competency-evaluation.dto';
export * from './lib/subcompetency-historical-score/dto/user-subcompetency-evaluation.dto';

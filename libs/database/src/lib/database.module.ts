import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import 'dotenv/config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PG_HOST ?? 'localhost',
      port: Number(process.env.PG_PORT ?? 5432),
      username: process.env.PG_USERNAME ?? 'postgres',
      password: process.env.PG_PASSWORD ?? 'postgres',
      database: process.env.PG_DATABASE ?? 'app',
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}


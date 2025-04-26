import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const capturePostgres = require('aws-xray-sdk-postgres');
import * as PG from 'pg';
import { AuthModule } from '../auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectsModule } from '../projects/projects.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        name: 'default',
        type: 'postgres',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        synchronize: false,
        logging: false,
        entities: [`${__dirname}/../../infrastructure/entities/*{.js,.ts}`],
        migrations: [`${__dirname}/../../infrastructure/migrations/*{.js,.ts}`],
        driver: process.env.IS_LOCAL ? PG : capturePostgres(PG),
        ssl: {
          rejectUnauthorized: false, // Disable full certificate validation for easier development use
        },
      }),
    }),
    AuthModule,
    ProjectsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

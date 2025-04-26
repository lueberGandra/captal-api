import { NestFactory } from '@nestjs/core';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import * as express from 'express';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import * as compression from 'compression';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './config/swagger.config';
import { AppModule } from './modules/app/app.module';
import { HttpExceptionInterceptor } from './common/interceptors/http-exception.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const environment = process.env.NODE_ENV || 'development';
  dotenv.config({ path: `.env.${environment}` });
  const expressApp = express();
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(expressApp),
  );
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionInterceptor());
  app.set('trust proxy', true);
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors();
  if (process.env.NODE_ENV !== 'production') {
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
  }
  app.use(compression());
  await app.listen(5000, () => {
    console.info(
      `🚀 \x1b[32mApplication is running on:\x1b[0m \x1b[36mhttp://localhost:5000\x1b[0m`,
    );
  });
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import { configure as serverlessExpress } from '@vendia/serverless-express';
import * as express from 'express';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import * as compression from 'compression';
import { globalLogger, withRequest } from './logger';
import { CustomMessageTriggerEvent } from 'aws-lambda';
import * as AWSXRay from 'aws-xray-sdk-core';
import { noop } from 'lodash';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './src/config/swagger.config';
import { AppModule } from 'src/modules/app/app.module';
import { HttpExceptionInterceptor } from 'src/common/interceptors/http-exception.interceptor';
import { ResponseInterceptor } from 'src/common/interceptors/response.interceptor';
AWSXRay.setContextMissingStrategy(noop);

export function setNestGlobalConfig(nestApp: INestApplication) {
  nestApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  nestApp.enableCors({
    maxAge: 86400,
  });
  if (process.env.NODE_ENV !== 'production') {
    const document = SwaggerModule.createDocument(nestApp, swaggerConfig);
    SwaggerModule.setup('docs', nestApp, document);
  }
  nestApp.use(compression());
}

let cachedServer: any;
async function bootstrapServer(): Promise<any> {
  if (!cachedServer) {
    const expressApp = express();
    const options = {};
    if (globalLogger) Object.assign(options, { logger: globalLogger });
    const nestApp = await NestFactory.create<NestExpressApplication>(
      AppModule,
      new ExpressAdapter(expressApp),
      options,
    );
    nestApp.useGlobalInterceptors(new ResponseInterceptor());
    nestApp.useGlobalFilters(new HttpExceptionInterceptor());
    nestApp.set('trust proxy', true);
    nestApp.use(express.json({ limit: '50mb' }));
    nestApp.use(express.urlencoded({ extended: true, limit: '50mb' }));
    setNestGlobalConfig(nestApp);
    cachedServer = serverlessExpress({ app: expressApp });
    cachedServer.log = new Logger('ServerlessExpress');
    await nestApp.init();
  }
  return cachedServer;
}

export const handler = async (
  event: CustomMessageTriggerEvent,
  context: any,
  callback: any,
) => {
  withRequest(event, context);
  const server = await bootstrapServer();

  return server(event, context, callback);
};

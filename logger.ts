import pino from 'pino';
import {
  lambdaRequestTracker,
  pinoLambdaDestination,
  PinoLogFormatter,
} from 'pino-lambda';
import { isServerlessOffline } from 'src/environment';

const destination = pinoLambdaDestination();

const options = isServerlessOffline()
  ? {
      transport: { target: 'pino-pretty', options: { colorize: true } },
      formatter: new PinoLogFormatter(),
    }
  : {};

export const globalLogger = pino(
  {
    level: (process.env.logLevel || 'debug').toLowerCase(),
    customLevels: {
      log: 30, // LOG_LEVEL_INFO
    },
    ...options,
  },
  destination,
);

export const withRequest = lambdaRequestTracker({
  requestMixin: (event) => ({
    host: event.headers?.host,
    path: event.path,
    queryStringParameters: event.queryStringParameters,
  }),
});

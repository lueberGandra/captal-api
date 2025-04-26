import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { map } from 'rxjs/operators';

export interface Response<T> {
    data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
    private readonly logger = new Logger(ResponseInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler) {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const startTime = Date.now();

        return next.handle().pipe(
            map((data) => {
                const responseTime = Date.now() - startTime;
                const responseBody = {
                    statusCode: response.statusCode,
                    timestamp: new Date().toISOString(),
                    path: request.url,
                    data,
                };

                // Log successful response
                this.logger.log(
                    `Response: ${response.statusCode} - ${request.method} ${request.url}`,
                    {
                        method: request.method,
                        path: request.url,
                        responseTime: `${responseTime}ms`,
                        statusCode: response.statusCode,
                        timestamp: new Date().toISOString(),
                    },
                );

                return responseBody;
            }),
        );
    }
}

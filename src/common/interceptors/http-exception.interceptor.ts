import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionInterceptor implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionInterceptor.name);

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();

        const message =
            typeof exceptionResponse === 'string'
                ? exceptionResponse
                : (exceptionResponse as any).message;

        const body = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message,
        };

        // Enhanced logging
        this.logger.error(
            `HTTP Exception: ${status} - ${message}`,
            {
                path: request.url,
                method: request.method,
                body: request.body,
                query: request.query,
                params: request.params,
                headers: request.headers,
                timestamp: new Date().toISOString(),
                stack: exception.stack,
            },
            HttpExceptionInterceptor.name,
        );

        response.status(status).json(body);
    }
}

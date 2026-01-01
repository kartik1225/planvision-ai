import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(BadRequestException)
export class DebugValidationFilter implements ExceptionFilter {
    private readonly logger = new Logger(DebugValidationFilter.name);

    catch(exception: BadRequestException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();

        this.logger.error('❌ [DEBUG] Validation Failed');
        this.logger.error(`Request Body: ${JSON.stringify(request.body, null, 2)}`);
        this.logger.error(`Error Details: ${JSON.stringify(exceptionResponse, null, 2)}`);

        response.status(status).json(exceptionResponse);
    }
}

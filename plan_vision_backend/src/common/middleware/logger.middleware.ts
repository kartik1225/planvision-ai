import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private logger = new Logger('HTTP');

    use(req: Request, res: Response, next: NextFunction) {
        const { method, originalUrl } = req;
        const userAgent = req.get('user-agent') || '';
        const start = Date.now();

        this.logger.log(`Incoming Request: ${method} ${originalUrl} - ${userAgent}`);

        res.on('finish', () => {
            const { statusCode } = res;
            const contentLength = res.get('content-length');
            const duration = Date.now() - start;
            this.logger.log(
                `Completed: ${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${duration}ms`,
            );
        });

        res.on('close', () => {
            if (!res.writableEnded) {
                const duration = Date.now() - start;
                this.logger.warn(
                    `Aborted: ${method} ${originalUrl} - ${userAgent} ${duration}ms`,
                );
            }
        });

        next();
    }
}

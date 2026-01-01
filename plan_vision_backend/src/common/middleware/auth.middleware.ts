import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { auth } from '../../auth/auth.config';
import { fromNodeHeaders } from 'better-auth/node';

// 1. Define the Session type from Better Auth return type
type SessionData = Awaited<ReturnType<typeof auth.api.getSession>>;

// 2. Augment the Express Request interface
declare module 'express' {
  interface Request {
    session?: SessionData;
  }
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (session) {
        // 3. Now TypeScript knows 'session' exists on 'req'
        req.session = session;
      }
    } catch (error) {
      console.error('Auth Middleware Error:', error);
    }

    next();
  }
}

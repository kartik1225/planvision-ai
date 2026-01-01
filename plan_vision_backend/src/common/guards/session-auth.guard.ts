import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { Request } from 'express';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { session?: UserSession }>();

    const session = request.session;

    if (!session) {
      throw new UnauthorizedException('Session is required');
    }

    return true;
  }
}

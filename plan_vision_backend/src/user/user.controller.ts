import {
  Controller,
  Get,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';

@ApiTags('Users')
@ApiCookieAuth()
@ApiBearerAuth('access-token')
@Controller('users')
@UseGuards(SessionAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile.' })
  @ApiResponse({
    status: 200,
    description: 'Returns the authenticated user profile.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Session is missing or invalid.',
  })
  async getMe(@Session() session: UserSession) {
    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    return this.userService.getProfileFromSession(session);
  }
}

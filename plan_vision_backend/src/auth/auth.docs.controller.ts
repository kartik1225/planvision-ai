import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { fromNodeHeaders } from 'better-auth/node';
import type { Request as ExpressRequest } from 'express';
import { auth } from './auth.config';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { SocialLoginDto } from './dto/social-login.dto';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthDocsController {
  constructor(private readonly authService: AuthService<typeof auth>) {}

  @Post('sign-in/email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiResponse({ status: 200, description: 'User signed in successfully' })
  @ApiBody({ type: SignInDto })
  async signIn(@Body() body: SignInDto, @Req() req: ExpressRequest) {
    return this.authService.api.signInEmail({
      body,
      headers: fromNodeHeaders(req.headers),
    });
  }

  @Post('sign-in/social')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with Social Provider' })
  async signInSocial(@Body() body: SocialLoginDto, @Req() req: ExpressRequest) {
    console.log(
      '🔥 [DEBUG] Incoming Social Login Body:',
      JSON.stringify(body, null, 2),
    );

    // 1. Construct a valid full URL for callback
    // Better Auth validation often requires a valid absolute URL
    const baseURL = process.env.BETTER_AUTH_BASE_URL || 'http://localhost:3000';
    const callbackURL = body.callbackURL
      ? body.callbackURL.startsWith('http')
        ? body.callbackURL
        : `${baseURL}${body.callbackURL}`
      : baseURL;

    const payload = {
      provider: body.provider,
      callbackURL: callbackURL,
      idToken: {
        token: body.idToken,
        nonce: body.nonce,
      },
    };

    console.log(
      '🔥 [DEBUG] Sending Payload to Better Auth:',
      JSON.stringify(payload, null, 2),
    );

    try {
      return await this.authService.api.signInSocial({
        body: payload,
        headers: fromNodeHeaders(req.headers),
      });
    } catch (e: any) {
      // 🔍 DEBUG: This will print the exact validation issue
      console.error('❌ [DEBUG] Error Details:', JSON.stringify(e, null, 2));

      // Sometimes Better Auth errors are hidden inside e.body or e.details
      if (e.body) console.error('❌ [DEBUG] Error Body:', e.body);

      throw e;
    }
  }

  @Post('sign-up/email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign up with email and password' })
  @ApiResponse({ status: 200, description: 'User signed up successfully' })
  @ApiBody({ type: SignUpDto })
  async signUp(@Body() body: SignUpDto, @Req() req: ExpressRequest) {
    return this.authService.api.signUpEmail({
      body,
      headers: fromNodeHeaders(req.headers),
    });
  }

  @Post('sign-out')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign out current session' })
  @ApiResponse({ status: 200, description: 'User signed out successfully' })
  async signOut(@Req() req: ExpressRequest) {
    return this.authService.api.signOut({
      headers: fromNodeHeaders(req.headers),
    });
  }
}

import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  @AllowAnonymous()
  @ApiOperation({ summary: 'Health check / Welcome message.' })
  @ApiResponse({ status: 200, description: 'Returns a welcome string.' })
  getHello(): string {
    return this.appService.getHello();
  }
}

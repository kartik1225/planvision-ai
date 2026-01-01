import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Session as SessionDecorator,
  UseGuards,
} from '@nestjs/common';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateRenderConfigDto } from './dto/create-render-config.dto';
import { UpdateRenderConfigDto } from './dto/update-render-config.dto';
import { RenderConfigService } from './render-config.service';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { GenerationService } from '../generation/generation.service';
import { GenerationStatusDto } from '../generation/dto/generation-status.dto';

@ApiTags('Render Configs')
@ApiCookieAuth()
@ApiBearerAuth('access-token')
@Controller('render-configs')
@UseGuards(SessionAuthGuard)
export class RenderConfigController {
  constructor(
    private readonly renderConfigService: RenderConfigService,
    private readonly generationService: GenerationService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a render job with specified settings.' })
  @ApiResponse({ status: 201, description: 'Render config created.' })
  async create(
    @Body() dto: CreateRenderConfigDto,
    @SessionDecorator() session: UserSession,
  ) {
    // 1. Create the Config Record
    const config = await this.renderConfigService.create(dto, session);

    // 2. Trigger the AI Generation Background Process
    this.generationService.processRenderConfig(config.id);

    return config;
  }

  @Get(':id/generation')
  @ApiOperation({ summary: 'Get the latest generation status for a config.' })
  @ApiResponse({
    status: 200,
    description: 'Status details.',
    type: GenerationStatusDto,
  })
  async getGenerationStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @SessionDecorator() session: UserSession,
  ) {
    await this.renderConfigService.findOne(id, session);

    const generation = await this.generationService.getLatestGeneration(id);

    if (!generation) {
      return { id: '', status: 'pending' };
    }

    return generation;
  }

  @Get(':id/generations') // Plural
  @ApiOperation({ summary: 'Get all generations for a config.' })
  @ApiResponse({
    status: 200,
    description: 'List of generations.',
    type: [GenerationStatusDto],
  })
  async getGenerations(
    @Param('id', ParseUUIDPipe) id: string,
    @SessionDecorator() session: UserSession,
  ) {
    // 1. Check Access
    await this.renderConfigService.findOne(id, session);

    // 2. Call Service (Fixed)
    return this.generationService.getHistory(id);
  }

  @Get()
  @ApiOperation({
    summary: 'List render configs for a project (provide projectId).',
  })
  findAll(
    @Query('projectId', ParseUUIDPipe) projectId: string,
    @SessionDecorator() session: UserSession,
  ) {
    return this.renderConfigService.findAllByProject(projectId, session);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single render config by ID.' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @SessionDecorator() session: UserSession,
  ) {
    return this.renderConfigService.findOne(id, session);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update metadata, instructions, or parameters.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRenderConfigDto,
    @SessionDecorator() session: UserSession,
  ) {
    return this.renderConfigService.update(id, dto, session);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a render config.' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @SessionDecorator() session: UserSession,
  ) {
    return this.renderConfigService.remove(id, session);
  }
}

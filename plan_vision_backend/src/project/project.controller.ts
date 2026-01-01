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
  UseGuards,
} from '@nestjs/common';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { Session } from '@thallesp/nestjs-better-auth';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectService } from './project.service';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';

@ApiTags('Projects')
@ApiCookieAuth()
@ApiBearerAuth('access-token')
@Controller('projects')
@UseGuards(SessionAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) { }
  @Post()
  @ApiOperation({ summary: 'Create a new project.' })
  @ApiResponse({
    status: 201,
    description: 'The project has been successfully created.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Session is required.',
  })
  create(@Body() dto: CreateProjectDto, @Session() session: UserSession) {
    return this.projectService.create(dto, session);
  }

  @Get()
  @ApiOperation({ summary: 'List all projects belonging to the current user.' })
  @ApiResponse({ status: 200, description: 'List of projects.' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Session is required.',
  })
  findAll(@Session() session: UserSession) {
    return this.projectService.findAll(session);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific project by ID.' })
  @ApiResponse({ status: 200, description: 'The project details.' })
  @ApiResponse({
    status: 404,
    description: 'Project not found or does not belong to user.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Session is required.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Session() session: UserSession,
  ) {
    return this.projectService.findOne(session, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project.' })
  @ApiResponse({ status: 200, description: 'The updated project.' })
  @ApiResponse({
    status: 404,
    description: 'Project not found or does not belong to user.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Session is required.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
    @Session() session: UserSession,
  ) {
    return this.projectService.update(id, dto, session);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a project.' })
  @ApiResponse({
    status: 204,
    description: 'The project has been successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found or does not belong to user.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Session is required.',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Session() session: UserSession,
  ) {
    return this.projectService.remove(id, session);
  }
}

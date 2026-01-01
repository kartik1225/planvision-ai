import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe, // ✅ Changed to ParseUUIDPipe
  Post,
  Session as SessionDecorator,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateInputImageDto } from './dto/create-input-image.dto';
import { InputImageService } from './input-image.service';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';

@ApiTags('Input Images')
@ApiCookieAuth()
@ApiBearerAuth('access-token')
@Controller('input-images')
@UseGuards(SessionAuthGuard)
export class InputImageController {
  constructor(private readonly inputImageService: InputImageService) {}

  @Post()
  @ApiOperation({
    summary: 'Register a new uploaded image URL for the current user.',
  })
  @ApiResponse({ status: 201, description: 'Image registered successfully.' })
  create(
    @Body() dto: CreateInputImageDto,
    @SessionDecorator() session: UserSession,
  ) {
    return this.inputImageService.create(dto, session);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({
    summary: 'Upload a file to Google Cloud Storage and register it.',
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded and registered successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request. File is missing.' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Session is required.',
  })
  upload(
    @UploadedFile() file: Express.Multer.File,
    @SessionDecorator() session: UserSession,
  ) {
    if (!file) {
      throw new BadRequestException('File upload missing');
    }
    return this.inputImageService.createFromUpload(file, session);
  }

  @Get(':id/url')
  @ApiOperation({ summary: 'Generate a signed URL for downloading the image.' })
  getSignedUrl(
    @Param('id', ParseUUIDPipe) id: string, // ✅ Changed to string
    @SessionDecorator() session: UserSession,
  ) {
    return this.inputImageService.getSignedUrl(id, session);
  }

  @Get()
  @ApiOperation({ summary: 'List input images for the current user.' })
  findAll(@SessionDecorator() session: UserSession) {
    return this.inputImageService.findAll(session);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single uploaded image by ID (must belong to user).',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string, // ✅ Changed to string
    @SessionDecorator() session: UserSession,
  ) {
    return this.inputImageService.findOne(id, session);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an uploaded image record.' })
  remove(
    @Param('id', ParseUUIDPipe) id: string, // ✅ Changed to string
    @SessionDecorator() session: UserSession,
  ) {
    return this.inputImageService.remove(id, session);
  }
}

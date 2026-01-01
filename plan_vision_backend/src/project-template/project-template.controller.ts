import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { ProjectTemplateService } from './project-template.service';
import { PexelsService } from './pexels.service';
import { PixabayService } from './pixabay.service';
import { ProjectTemplateDto } from './dto/project-template.dto';
import { CreateProjectTemplateDto } from './dto/create-project-template.dto';
import { SuggestTemplateDto, SuggestTemplateResponseDto } from './dto/suggest-template.dto';
import { GenerateThumbnailDto, GenerateThumbnailResponseDto } from './dto/generate-thumbnail.dto';
import { SearchPexelsDto, SearchPexelsResponseDto } from './dto/search-pexels.dto';
import { SearchPixabayDto, SearchPixabayResponseDto } from './dto/search-pixabay.dto';

@ApiTags('Project Templates')
@ApiCookieAuth()
@ApiBearerAuth('access-token')
@Controller('project-templates')
@UseGuards(SessionAuthGuard)
export class ProjectTemplateController {
  constructor(
    private readonly projectTemplateService: ProjectTemplateService,
    private readonly pexelsService: PexelsService,
    private readonly pixabayService: PixabayService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project template for the home screen.' })
  @ApiResponse({
    status: 201,
    description: 'Project template created successfully.',
    type: ProjectTemplateDto,
  })
  @ApiBody({ type: CreateProjectTemplateDto })
  create(@Body() dto: CreateProjectTemplateDto) {
    return this.projectTemplateService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all UI templates for the home screen.' })
  @ApiResponse({
    status: 200,
    description: 'List of project templates.',
    type: [ProjectTemplateDto],
  })
  findAll() {
    return this.projectTemplateService.findAll();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project template.' })
  @ApiResponse({
    status: 200,
    description: 'Project template deleted successfully.',
  })
  delete(@Param('id') id: string) {
    return this.projectTemplateService.delete(id);
  }

  @Post('suggest')
  @ApiOperation({ summary: 'Generate AI-powered template suggestions.' })
  @ApiBody({ type: SuggestTemplateDto })
  @ApiResponse({
    status: 201,
    description: 'Template suggestions generated successfully.',
    type: SuggestTemplateResponseDto,
  })
  suggest(@Body() dto: SuggestTemplateDto) {
    return this.projectTemplateService.suggestTemplates(dto.description);
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
  @ApiOperation({ summary: 'Upload an image asset for templates.' })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully.',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
      },
    },
  })
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File upload missing');
    }
    return this.projectTemplateService.uploadAsset(file);
  }

  @Post('generate-thumbnail')
  @ApiOperation({
    summary: 'Generate AI thumbnail for a template.',
    description: 'Generates an AI-transformed version of the source image using the specified style and options.',
  })
  @ApiBody({ type: GenerateThumbnailDto })
  @ApiResponse({
    status: 201,
    description: 'Thumbnail generated successfully.',
    type: GenerateThumbnailResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'ImageType or Style not found.',
  })
  generateThumbnail(@Body() dto: GenerateThumbnailDto) {
    return this.projectTemplateService.generateThumbnail(dto);
  }

  @Get('search-images')
  @ApiOperation({
    summary: 'Search Pexels for stock photos.',
    description: 'Search the Pexels library for sample images to use in templates.',
  })
  @ApiQuery({ name: 'query', required: true, description: 'Search query' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'perPage', required: false, description: 'Results per page' })
  @ApiQuery({ name: 'orientation', required: false, enum: ['landscape', 'portrait', 'square'] })
  @ApiResponse({
    status: 200,
    description: 'Search results from Pexels.',
    type: SearchPexelsResponseDto,
  })
  async searchImages(@Query() dto: SearchPexelsDto): Promise<SearchPexelsResponseDto> {
    const result = await this.pexelsService.searchPhotos(
      dto.query,
      dto.page,
      dto.perPage,
      dto.orientation,
    );

    return {
      totalResults: result.total_results,
      page: result.page,
      perPage: result.per_page,
      photos: result.photos.map((p) => ({
        id: p.id,
        width: p.width,
        height: p.height,
        url: p.url,
        photographer: p.photographer,
        src: p.src,
        alt: p.alt,
      })),
    };
  }

  @Get('search-pixabay')
  @ApiOperation({
    summary: 'Search Pixabay for stock photos.',
    description: 'Search the Pixabay library for source images to use in templates.',
  })
  @ApiQuery({ name: 'query', required: true, description: 'Search query' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'perPage', required: false, description: 'Results per page' })
  @ApiQuery({ name: 'imageType', required: false, enum: ['all', 'photo', 'illustration', 'vector'] })
  @ApiResponse({
    status: 200,
    description: 'Search results from Pixabay.',
    type: SearchPixabayResponseDto,
  })
  async searchPixabay(@Query() dto: SearchPixabayDto): Promise<SearchPixabayResponseDto> {
    const result = await this.pixabayService.searchImages(
      dto.query,
      dto.page,
      dto.perPage,
      dto.imageType,
    );

    return {
      total: result.total,
      totalHits: result.totalHits,
      hits: result.hits.map((img) => ({
        id: img.id,
        pageURL: img.pageURL,
        tags: img.tags,
        previewURL: img.previewURL,
        webformatURL: img.webformatURL,
        largeImageURL: img.largeImageURL,
        imageWidth: img.imageWidth,
        imageHeight: img.imageHeight,
        user: img.user,
        userImageURL: img.userImageURL,
      })),
    };
  }
}

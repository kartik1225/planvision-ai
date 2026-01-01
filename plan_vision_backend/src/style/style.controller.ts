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
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateStyleDto } from './dto/create-style.dto';
import { UpdateStyleDto } from './dto/update-style.dto';
import {
  GenerateStyleThumbnailDto,
  GenerateStyleThumbnailResponseDto,
} from './dto/generate-style-thumbnail.dto';
import {
  SuggestStylePromptsDto,
  SuggestStylePromptsResponseDto,
} from './dto/suggest-style-prompts.dto';
import {
  BuildImagePromptDto,
  BuildImagePromptResponseDto,
} from './dto/build-image-prompt.dto';
import { StyleService } from './style.service';

@ApiTags('Styles')
@Controller('styles')
export class StyleController {
  constructor(private readonly styleService: StyleService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new style entry.' })
  create(@Body() dto: CreateStyleDto) {
    return this.styleService.create(dto);
  }

  @Post('suggest-prompts')
  @ApiOperation({ summary: 'Generate AI suggestions for style prompts and thumbnail options.' })
  @ApiResponse({ status: 200, type: SuggestStylePromptsResponseDto })
  suggestPrompts(
    @Body() dto: SuggestStylePromptsDto,
  ): Promise<SuggestStylePromptsResponseDto> {
    return this.styleService.suggestStylePrompts(dto);
  }

  @Post('generate-thumbnail')
  @ApiOperation({ summary: 'Generate a style thumbnail using AI from a selected prompt.' })
  @ApiResponse({ status: 200, type: GenerateStyleThumbnailResponseDto })
  generateThumbnail(
    @Body() dto: GenerateStyleThumbnailDto,
  ): Promise<GenerateStyleThumbnailResponseDto> {
    return this.styleService.generateStyleThumbnail(dto);
  }

  @Post('build-image-prompt')
  @ApiOperation({ summary: 'Generate an AI image prompt from existing style data.' })
  @ApiResponse({ status: 200, type: BuildImagePromptResponseDto })
  buildImagePrompt(
    @Body() dto: BuildImagePromptDto,
  ): Promise<BuildImagePromptResponseDto> {
    return this.styleService.buildImagePrompt(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all styles alphabetically.',
    description:
      'Optionally pass imageTypeId to filter styles for that image type and get contextual thumbnails.',
  })
  @ApiQuery({
    name: 'imageTypeId',
    required: false,
    description:
      'Filter styles by image type. If provided, returns the contextual thumbnail for that image type.',
  })
  findAll(@Query('imageTypeId') imageTypeId?: string) {
    return this.styleService.findAll(imageTypeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single style by ID.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.styleService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update style fields.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateStyleDto) {
    return this.styleService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a style.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.styleService.remove(id);
  }
}

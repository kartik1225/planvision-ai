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
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateImageTypeDto } from './dto/create-image-type.dto';
import { UpdateImageTypeDto } from './dto/update-image-type.dto';
import { ImageTypeService } from './image-type.service';

@ApiTags('Image Types')
@Controller('image-types')
export class ImageTypeController {
  constructor(private readonly imageTypeService: ImageTypeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new image type (admin use).' })
  @ApiResponse({ status: 201, description: 'Image type created.' })
  create(@Body() dto: CreateImageTypeDto) {
    return this.imageTypeService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all image types sorted by label.' })
  @ApiResponse({ status: 200, description: 'List of image types.' })
  findAll() {
    return this.imageTypeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single image type by ID.' })
  @ApiResponse({ status: 200, description: 'Image type details.' })
  @ApiResponse({ status: 404, description: 'Image type not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.imageTypeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update label/value/description.' })
  @ApiResponse({ status: 200, description: 'Image type updated.' })
  @ApiResponse({ status: 404, description: 'Image type not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateImageTypeDto,
  ) {
    return this.imageTypeService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an image type.' })
  @ApiResponse({ status: 204, description: 'Image type deleted.' })
  @ApiResponse({ status: 404, description: 'Image type not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.imageTypeService.remove(id);
  }
}

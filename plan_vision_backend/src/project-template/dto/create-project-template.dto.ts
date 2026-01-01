import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUrl,
  IsUUID,
  IsArray,
  IsOptional,
  IsObject,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateProjectTemplateDto {
  @ApiProperty({
    description: 'Template card title',
    example: 'Modern Bathroom',
  })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    description: 'Template description for the card',
    example: 'Transform your bathroom into a relaxing spa retreat.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Thumbnail image URL for the card (display thumbnail)',
    example: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600',
  })
  @IsUrl()
  thumbnailUrl: string;

  @ApiPropertyOptional({
    description: 'Original "before" thumbnail image URL',
    example: 'https://storage.googleapis.com/planvision-uploads/templates/original.jpg',
  })
  @IsOptional()
  @ValidateIf((o) => o.originalThumbnailUrl !== '' && o.originalThumbnailUrl != null)
  @IsUrl()
  originalThumbnailUrl?: string;

  @ApiPropertyOptional({
    description: 'AI-generated "after" thumbnail image URL',
    example: 'https://storage.googleapis.com/planvision-uploads/templates/generated.jpg',
  })
  @IsOptional()
  @ValidateIf((o) => o.generatedThumbnailUrl !== '' && o.generatedThumbnailUrl != null)
  @IsUrl()
  generatedThumbnailUrl?: string;

  @ApiProperty({
    description: 'Array of sample image URLs for inspiration',
    type: [String],
    example: [
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=600',
    ],
  })
  @IsArray()
  @IsUrl({}, { each: true })
  sampleImageUrls: string[];

  @ApiProperty({
    description: 'UUID of the default ImageType for this template',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  defaultImageTypeId: string;

  @ApiPropertyOptional({
    description: 'UUID of the default Style for this template',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID()
  defaultStyleId?: string;

  @ApiPropertyOptional({
    description: 'Generation options used for the thumbnail (colors, perspective, etc.)',
    example: {
      colorPrimaryHex: '#3B82F6',
      colorSecondaryHex: '#10B981',
      perspectiveAngle: 45,
    },
  })
  @IsOptional()
  @IsObject()
  generationOptions?: Record<string, unknown>;
}

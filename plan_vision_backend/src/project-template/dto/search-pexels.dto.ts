import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsIn, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchPexelsDto {
  @ApiProperty({ description: 'Search query for photos' })
  @IsString()
  query: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Results per page', default: 15 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(80)
  perPage?: number;

  @ApiPropertyOptional({
    description: 'Photo orientation',
    enum: ['landscape', 'portrait', 'square'],
  })
  @IsOptional()
  @IsIn(['landscape', 'portrait', 'square'])
  orientation?: 'landscape' | 'portrait' | 'square';
}

export class PexelsPhotoDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  width: number;

  @ApiProperty()
  height: number;

  @ApiProperty()
  url: string;

  @ApiProperty()
  photographer: string;

  @ApiProperty()
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };

  @ApiProperty()
  alt: string;
}

export class SearchPexelsResponseDto {
  @ApiProperty()
  totalResults: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  perPage: number;

  @ApiProperty({ type: [PexelsPhotoDto] })
  photos: PexelsPhotoDto[];
}

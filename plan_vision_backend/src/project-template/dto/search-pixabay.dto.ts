import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchPixabayDto {
  @ApiProperty({ description: 'Search query' })
  @IsString()
  query: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: 'Results per page', default: 15 })
  @IsOptional()
  @IsInt()
  @Min(3)
  @Max(200)
  @Type(() => Number)
  perPage?: number;

  @ApiPropertyOptional({
    description: 'Image type filter',
    enum: ['all', 'photo', 'illustration', 'vector'],
  })
  @IsOptional()
  @IsEnum(['all', 'photo', 'illustration', 'vector'])
  imageType?: 'all' | 'photo' | 'illustration' | 'vector';
}

export class PixabayImageDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  pageURL: string;

  @ApiProperty()
  tags: string;

  @ApiProperty()
  previewURL: string;

  @ApiProperty()
  webformatURL: string;

  @ApiProperty()
  largeImageURL: string;

  @ApiProperty()
  imageWidth: number;

  @ApiProperty()
  imageHeight: number;

  @ApiProperty()
  user: string;

  @ApiProperty()
  userImageURL: string;
}

export class SearchPixabayResponseDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  totalHits: number;

  @ApiProperty({ type: [PixabayImageDto] })
  hits: PixabayImageDto[];
}

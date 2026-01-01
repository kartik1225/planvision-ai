import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ProjectTemplateDto {
  @ApiProperty()
  @Expose()
  id: string; // ✅ Changed to string

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty({ required: false })
  @Expose()
  description?: string;

  @ApiProperty()
  @Expose()
  thumbnailUrl: string;

  @ApiProperty()
  @Expose()
  sampleImageUrls: string[];

  @ApiProperty()
  @Expose()
  defaultImageTypeId: string;
}

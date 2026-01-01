import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';

export class CreateInputImageDto {
  @ApiProperty({
    description: 'Cloud storage URL pointing to the uploaded file.',
    example: 'https://storage.googleapis.com/plan-vision/uploads/123.png',
  })
  @IsString()
  @IsUrl()
  url!: string; // ✅ Renamed from imageUrl to url
}

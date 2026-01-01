import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class SuggestTemplateDto {
  @ApiProperty({
    description: 'Description of what the template should be about',
    example: 'A cozy Scandinavian living room with natural light and minimalist furniture',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  description: string;
}

export class TemplateSuggestion {
  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  imageTypeId: string;

  @ApiProperty()
  imageTypeLabel: string;

  @ApiProperty({
    description: 'Suggested search keywords for finding sample images on Pexels',
    example: ['modern kitchen interior', 'white kitchen cabinets'],
  })
  sampleImageKeywords: string[];
}

export class SuggestTemplateResponseDto {
  @ApiProperty({ type: [TemplateSuggestion] })
  suggestions: TemplateSuggestion[];
}

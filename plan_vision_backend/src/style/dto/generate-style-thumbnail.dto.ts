import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class GenerateStyleThumbnailDto {
  @ApiProperty({
    description: 'The complete image generation prompt (from AI suggestion)',
    example:
      'A modern minimalist living room with clean lines, neutral tones, and natural lighting',
  })
  @IsString()
  @IsNotEmpty()
  imagePrompt: string;
}

export class GenerateStyleThumbnailResponseDto {
  @ApiProperty({ description: 'Whether generation was successful' })
  success: boolean;

  @ApiPropertyOptional({ description: 'URL of the generated thumbnail image' })
  generatedImageUrl?: string;

  @ApiPropertyOptional({ description: 'The prompt that was sent to the AI' })
  promptUsed?: string;

  @ApiPropertyOptional({ description: 'Error message if generation failed' })
  errorMessage?: string;
}

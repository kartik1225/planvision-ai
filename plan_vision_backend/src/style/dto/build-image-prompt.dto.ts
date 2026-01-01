import { IsArray, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BuildImagePromptDto {
  @ApiProperty({
    description: 'The name of the style',
    example: 'Modern Minimalist',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  styleName: string;

  @ApiProperty({
    description: 'The prompt fragment describing the style aesthetic',
    example: 'Clean lines, neutral color palette with white and gray tones...',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  promptFragment: string;

  @ApiProperty({
    description: 'Array of image type labels this style applies to',
    example: ['Living Room', 'Bedroom', 'Kitchen'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imageTypeLabels?: string[];
}

export class BuildImagePromptResponseDto {
  @ApiProperty({ description: 'Whether the prompt generation was successful' })
  success: boolean;

  @ApiProperty({
    description: 'The AI-generated image prompt',
    required: false,
  })
  imagePrompt?: string;

  @ApiProperty({ description: 'Error message if failed', required: false })
  errorMessage?: string;
}

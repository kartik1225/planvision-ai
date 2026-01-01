import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SuggestStylePromptsDto {
  @ApiProperty({
    description: 'User description of the style they want to create',
    example: 'Modern minimalist balcony',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description: string;
}

export class StyleSuggestion {
  @ApiProperty({ description: 'Suggested name for this style' })
  name: string;

  @ApiProperty({ description: 'Detailed prompt fragment describing the style' })
  promptFragment: string;

  @ApiProperty({
    description: 'Suggested image type labels this style applies to',
    type: [String],
  })
  suggestedImageTypes: string[];

  @ApiProperty({
    description: 'Pre-built image generation prompt with full context',
  })
  imageGenerationPrompt: string;
}

export class SuggestStylePromptsResponseDto {
  @ApiProperty({ description: 'Whether the suggestion was successful' })
  success: boolean;

  @ApiProperty({
    description: 'Three complete style suggestions',
    type: [StyleSuggestion],
    required: false,
  })
  suggestions?: StyleSuggestion[];

  @ApiProperty({ description: 'Error message if failed', required: false })
  errorMessage?: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsOptional,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

export class GenerateThumbnailDto {
  @ApiProperty({
    description: 'Source image URL to transform (the "before" image)',
    example: 'https://storage.googleapis.com/planvision-uploads/templates/original.jpg',
  })
  @IsString()
  @IsNotEmpty({ message: 'Please upload a source image first' })
  sourceImageUrl: string;

  @ApiProperty({
    description: 'Image type UUID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  imageTypeId: string;

  @ApiProperty({
    description: 'Style UUID to apply',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsUUID()
  styleId: string;

  @ApiPropertyOptional({
    description: 'Primary hex color for the design',
    example: '#3B82F6',
  })
  @IsOptional()
  @IsString()
  @MaxLength(8)
  colorPrimaryHex?: string;

  @ApiPropertyOptional({
    description: 'Secondary hex color for accents',
    example: '#10B981',
  })
  @IsOptional()
  @IsString()
  @MaxLength(8)
  colorSecondaryHex?: string;

  @ApiPropertyOptional({
    description: 'Neutral hex color for backgrounds',
    example: '#F3F4F6',
  })
  @IsOptional()
  @IsString()
  @MaxLength(8)
  colorNeutralHex?: string;

  @ApiPropertyOptional({
    description: 'Camera/perspective angle in degrees (0-90)',
    example: 45,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(90)
  perspectiveAngle?: number;

  @ApiPropertyOptional({
    description: 'Perspective X coordinate (0-100)',
    example: 50,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  perspectiveX?: number;

  @ApiPropertyOptional({
    description: 'Perspective Y coordinate (0-100)',
    example: 50,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  perspectiveY?: number;

  @ApiPropertyOptional({
    description: 'Additional custom instructions for the AI',
    example: 'Focus on natural lighting and minimalist furniture',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  customInstructions?: string;
}

export class GenerateThumbnailResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiPropertyOptional({
    description: 'URL of the generated thumbnail image',
  })
  generatedImageUrl?: string;

  @ApiPropertyOptional({
    description: 'The prompt that was sent to the AI',
  })
  promptUsed?: string;

  @ApiPropertyOptional({
    description: 'Error message if generation failed',
  })
  errorMessage?: string;
}

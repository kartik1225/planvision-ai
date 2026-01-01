import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateRenderConfigDto {
  @ApiProperty({ description: 'Project ID this job belongs to.' })
  @IsUUID() // ✅ Changed from IsInt
  projectId!: string;

  @ApiProperty({ description: 'Input image ID for the render.' })
  @IsUUID() // ✅ Changed from IsInt
  inputImageId!: string;

  @ApiProperty({ description: 'Image type ID describing the source.' })
  @IsUUID() // ✅ Changed from IsInt
  imageTypeId!: string;

  @ApiPropertyOptional({ description: 'Optional style ID chosen by the user.' })
  @IsOptional()
  @IsUUID() // ✅ Changed from IsInt
  styleId?: string;

  @ApiPropertyOptional({ description: 'Additional custom instructions.' })
  @IsOptional()
  @IsString()
  customInstructions?: string;

  @ApiPropertyOptional({ description: 'Primary hex color.' })
  @IsOptional()
  @IsString()
  @MaxLength(8)
  colorPrimaryHex?: string;

  @ApiPropertyOptional({ description: 'Secondary hex color.' })
  @IsOptional()
  @IsString()
  @MaxLength(8)
  colorSecondaryHex?: string;

  @ApiPropertyOptional({ description: 'Neutral hex color.' })
  @IsOptional()
  @IsString()
  @MaxLength(8)
  colorNeutralHex?: string;

  @ApiPropertyOptional({ description: 'Perspective angle in degrees.' })
  @IsOptional()
  @IsInt()
  perspectiveAngle?: number;

  @ApiPropertyOptional({ description: 'Perspective X coordinate.' })
  @IsOptional()
  @IsInt()
  perspectiveX?: number;

  @ApiPropertyOptional({ description: 'Perspective Y coordinate.' })
  @IsOptional()
  @IsInt()
  perspectiveY?: number;
}

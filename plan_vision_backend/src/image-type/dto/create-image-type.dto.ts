import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateImageTypeDto {
  @ApiProperty({
    description: 'User-facing label (e.g., "2D Floor Plan").',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  label!: string;

  @ApiProperty({
    description: 'Internal value key (e.g., "floor_plan_2d").',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  value!: string;

  @ApiPropertyOptional({
    description: 'Optional description shown in the UI.',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

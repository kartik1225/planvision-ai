import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateStyleDto {
  @ApiProperty({ description: 'User-facing name (e.g., "Modern").', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ description: 'Thumbnail URL displayed in the UI.' })
  @IsString()
  thumbnailUrl!: string;

  @ApiProperty({ description: 'Prompt fragment sent to the AI when this style is chosen.' })
  @IsString()
  promptFragment!: string;

  @ApiProperty({ description: 'Image type IDs this style applies to.', required: false })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  imageTypeIds?: string[];
}

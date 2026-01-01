import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Project name chosen by the user.',
    maxLength: 255,
    example: 'Downtown Loft Floor Plan',
  })
  @IsString()
  @MaxLength(255)
  name!: string;
}

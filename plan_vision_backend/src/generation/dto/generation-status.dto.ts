import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class GenerationStatusDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  status: string; // 'pending' | 'processing' | 'completed' | 'failed'

  @ApiProperty({ required: false })
  @Expose()
  outputImageUrl?: string;

  @ApiProperty({ required: false })
  @Expose()
  errorMessage?: string;
}

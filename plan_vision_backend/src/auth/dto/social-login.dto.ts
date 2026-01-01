import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class SocialLoginDto {
  @ApiProperty({
    example: 'apple',
    description: 'The provider name (apple, google)',
  })
  @IsString()
  @IsNotEmpty()
  provider: string;

  @ApiProperty({
    example: 'eyJ...',
    description: 'The ID Token from the provider',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;

  @ApiProperty({
    example: 'nonce123',
    description: 'The nonce used during the authorization request (optional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  nonce?: string;

  @ApiProperty({
    example: '/',
    description: 'Callback URL for redirection logic',
  })
  @IsString()
  @IsOptional() // Make it optional in DTO, but we might default it in controller
  callbackURL?: string;
}

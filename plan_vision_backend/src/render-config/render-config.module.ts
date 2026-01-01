import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RenderConfigController } from './render-config.controller';
import { RenderConfigService } from './render-config.service';
import { GenerationModule } from '../generation/generation.module';

@Module({
  imports: [PrismaModule, GenerationModule],
  controllers: [RenderConfigController],
  providers: [RenderConfigService],
})
export class RenderConfigModule {}

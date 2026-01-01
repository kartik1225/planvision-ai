import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { GenerationModule } from '../generation/generation.module';
import { ProjectTemplateController } from './project-template.controller';
import { ProjectTemplateService } from './project-template.service';
import { PexelsService } from './pexels.service';
import { PixabayService } from './pixabay.service';

@Module({
  imports: [PrismaModule, StorageModule, GenerationModule],
  controllers: [ProjectTemplateController],
  providers: [ProjectTemplateService, PexelsService, PixabayService],
})
export class ProjectTemplateModule {}

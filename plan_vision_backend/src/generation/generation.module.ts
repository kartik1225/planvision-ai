import { Module } from '@nestjs/common';
import { GenerationService } from './generation.service';
import { PromptBuilderService } from './prompt-builder.service';
import { GeminiService } from './gemini.service';
import { StorageModule } from '../storage/storage.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, StorageModule],
  providers: [GenerationService, PromptBuilderService, GeminiService],
  exports: [GenerationService, GeminiService, PromptBuilderService],
})
export class GenerationModule {}

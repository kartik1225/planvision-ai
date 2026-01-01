import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PromptBuilderService } from './prompt-builder.service';
import { GeminiService } from './gemini.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class GenerationService {
  private readonly logger = new Logger(GenerationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly promptBuilder: PromptBuilderService,
    private readonly aiService: GeminiService,
    private readonly storage: StorageService,
  ) {}

  async processRenderConfig(configId: string) {
    // 1. Create initial Generation record
    const generation = await this.prisma.generation.create({
      data: {
        renderConfigId: configId,
        status: 'processing',
        promptUsed: '',
      },
    });

    // Run async (don't await in controller)
    this.runGenerationLoop(generation.id, configId);

    return generation;
  }

  async getHistory(configId: string) {
    return this.prisma.generation.findMany({
      where: { renderConfigId: configId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLatestGeneration(configId: string) {
    return this.prisma.generation.findFirst({
      where: { renderConfigId: configId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async runGenerationLoop(generationId: string, configId: string) {
    try {
      // 2. Fetch Full Config
      const config = await this.prisma.renderConfig.findUnique({
        where: { id: configId },
        include: { imageType: true, style: true, inputImage: true },
      });

      if (!config) throw new Error('Config not found');

      // 3. Build Prompt
      const prompt = this.promptBuilder.buildPrompt(config);

      // 4. Call AI
      const outputBuffer = await this.aiService.generateImage(
        prompt,
        config.inputImage.url,
      );

      if (!outputBuffer) throw new Error('No image generated');

      // 5. Upload Result
      // We mock a file object for our storage service
      const mockFile = {
        buffer: outputBuffer,
        originalname: `gen-${generationId}.jpg`,
        mimetype: 'image/jpeg',
      } as any;

      const upload = await this.storage.uploadFile(mockFile);
      const publicUrl = this.storage.getPublicUrl(upload.objectName);

      // 6. Update DB
      await this.prisma.generation.update({
        where: { id: generationId },
        data: {
          status: 'completed',
          outputImageUrl: publicUrl,
          promptUsed: prompt,
        },
      });

      this.logger.log(`Generation ${generationId} completed.`);
    } catch (error) {
      this.logger.error(`Generation ${generationId} failed`, error);
      await this.prisma.generation.update({
        where: { id: generationId },
        data: {
          status: 'failed',
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }
}

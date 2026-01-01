import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { GeminiService } from '../generation/gemini.service';
import { PromptBuilderService } from '../generation/prompt-builder.service';
import { CreateProjectTemplateDto } from './dto/create-project-template.dto';
import { GenerateThumbnailDto, GenerateThumbnailResponseDto } from './dto/generate-thumbnail.dto';
import type { TemplateSuggestion } from './dto/suggest-template.dto';
import type { Prisma } from '@prisma/client';

@Injectable()
export class ProjectTemplateService {
  private readonly logger = new Logger(ProjectTemplateService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly gemini: GeminiService,
    private readonly promptBuilder: PromptBuilderService,
  ) {}

  async create(dto: CreateProjectTemplateDto) {
    return this.prisma.projectTemplate.create({
      data: {
        title: dto.title,
        description: dto.description,
        thumbnailUrl: dto.thumbnailUrl,
        originalThumbnailUrl: dto.originalThumbnailUrl,
        generatedThumbnailUrl: dto.generatedThumbnailUrl,
        sampleImageUrls: dto.sampleImageUrls,
        defaultImageTypeId: dto.defaultImageTypeId,
        defaultStyleId: dto.defaultStyleId,
        generationOptions: dto.generationOptions as Prisma.InputJsonValue | undefined,
      },
      include: {
        defaultImageType: true,
        defaultStyle: true,
      },
    });
  }

  async findAll() {
    return this.prisma.projectTemplate.findMany({
      orderBy: { id: 'asc' },
      include: {
        defaultImageType: true,
        defaultStyle: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.projectTemplate.delete({
      where: { id },
    });
  }

  async uploadAsset(file: Express.Multer.File) {
    const destination = `templates/${Date.now()}-${file.originalname}`;
    const { objectName } = await this.storage.uploadFile(file, destination);
    return { url: this.storage.getPublicUrl(objectName) };
  }

  async generateThumbnail(dto: GenerateThumbnailDto): Promise<GenerateThumbnailResponseDto> {
    try {
      // 1. Fetch ImageType and Style
      const [imageType, style] = await Promise.all([
        this.prisma.imageType.findUnique({ where: { id: dto.imageTypeId } }),
        this.prisma.style.findUnique({ where: { id: dto.styleId } }),
      ]);

      if (!imageType) {
        throw new NotFoundException(`ImageType ${dto.imageTypeId} not found`);
      }

      if (!style) {
        throw new NotFoundException(`Style ${dto.styleId} not found`);
      }

      // 2. Build prompt using shared PromptBuilderService
      const prompt = this.promptBuilder.buildPromptFromParams({
        imageType: { label: imageType.label },
        style: { name: style.name, promptFragment: style.promptFragment },
        colorPrimaryHex: dto.colorPrimaryHex,
        colorSecondaryHex: dto.colorSecondaryHex,
        colorNeutralHex: dto.colorNeutralHex,
        perspectiveAngle: dto.perspectiveAngle,
        perspectiveX: dto.perspectiveX,
        perspectiveY: dto.perspectiveY,
        customInstructions: dto.customInstructions,
      });

      this.logger.log(`Generating thumbnail with prompt: ${prompt.substring(0, 100)}...`);

      // 3. Generate image using Gemini
      const outputBuffer = await this.gemini.generateImage(prompt, dto.sourceImageUrl);

      if (!outputBuffer) {
        throw new BadRequestException('No image generated from AI');
      }

      // 4. Upload to GCS
      const mockFile = {
        buffer: outputBuffer,
        originalname: `thumbnail-generated-${Date.now()}.jpg`,
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      const destination = `templates/generated/${Date.now()}.jpg`;
      const { objectName } = await this.storage.uploadFile(mockFile, destination);
      const generatedUrl = this.storage.getPublicUrl(objectName);

      this.logger.log(`Thumbnail generated successfully: ${generatedUrl}`);

      return {
        success: true,
        generatedImageUrl: generatedUrl,
        promptUsed: prompt,
      };
    } catch (error) {
      this.logger.error('Thumbnail generation failed', error);

      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async suggestTemplates(description: string): Promise<{ suggestions: TemplateSuggestion[] }> {
    // Get all image types for the prompt
    const imageTypes = await this.prisma.imageType.findMany({
      orderBy: { label: 'asc' },
    });

    const imageTypesList = imageTypes
      .map((t) => `- id: "${t.id}", label: "${t.label}", value: "${t.value}"`)
      .join('\n');

    const prompt = `Generate 3 template suggestions for an architectural visualization app.

User wants: "${description}"

Available image types:
${imageTypesList}

Rules:
- Title: Simple and direct, like "Garden Redesign", "Kitchen Makeover", "Living Room Update"
- Description: Plain language explaining what this template helps users do. No marketing speak.
- Pick the most relevant imageTypeId from the list above
- sampleImageKeywords: Provide 2-3 specific search terms to find good sample photos on Pexels (stock photo site). Be specific about the room/space type, style, and key features. Examples: "modern white kitchen interior", "scandinavian living room minimalist", "backyard garden landscaping"

Return ONLY valid JSON, no markdown:
{
  "suggestions": [
    {
      "title": "Garden Redesign",
      "description": "Transform your outdoor space with new landscaping ideas",
      "imageTypeId": "exact-id-from-list",
      "imageTypeLabel": "label-from-list",
      "sampleImageKeywords": ["backyard garden landscaping", "outdoor patio design"]
    }
  ]
}`;

    this.logger.log('Generating template suggestions...');
    const response = await this.gemini.generateText(prompt);

    try {
      // Strip markdown code blocks if present
      let jsonStr = response.trim();
      if (jsonStr.startsWith('```')) {
        // Remove opening code fence (```json or ```)
        jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, '');
        // Remove closing code fence
        jsonStr = jsonStr.replace(/\n?```\s*$/, '');
      }

      const parsed = JSON.parse(jsonStr);

      // Validate that imageTypeIds are valid
      const validIds = new Set(imageTypes.map((t) => t.id));
      for (const suggestion of parsed.suggestions) {
        if (!validIds.has(suggestion.imageTypeId)) {
          // Find best match or use first available
          const match = imageTypes.find((t) =>
            t.label.toLowerCase().includes(suggestion.imageTypeLabel?.toLowerCase() || '') ||
            suggestion.title?.toLowerCase().includes(t.label.toLowerCase())
          );
          if (match) {
            suggestion.imageTypeId = match.id;
            suggestion.imageTypeLabel = match.label;
          } else {
            suggestion.imageTypeId = imageTypes[0].id;
            suggestion.imageTypeLabel = imageTypes[0].label;
          }
        }

        // Ensure sampleImageKeywords is always an array
        if (!Array.isArray(suggestion.sampleImageKeywords)) {
          suggestion.sampleImageKeywords = [];
        }
      }

      return parsed;
    } catch (error) {
      this.logger.error('Failed to parse AI response', error);
      this.logger.debug('Raw response:', response);
      throw new Error('Failed to generate suggestions. Please try again.');
    }
  }
}

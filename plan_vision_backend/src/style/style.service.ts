import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from '../generation/gemini.service';
import { StorageService } from '../storage/storage.service';
import { CreateStyleDto } from './dto/create-style.dto';
import { UpdateStyleDto } from './dto/update-style.dto';
import {
  GenerateStyleThumbnailDto,
  GenerateStyleThumbnailResponseDto,
} from './dto/generate-style-thumbnail.dto';
import {
  SuggestStylePromptsDto,
  SuggestStylePromptsResponseDto,
  StyleSuggestion,
} from './dto/suggest-style-prompts.dto';
import {
  BuildImagePromptDto,
  BuildImagePromptResponseDto,
} from './dto/build-image-prompt.dto';

@Injectable()
export class StyleService {
  private readonly logger = new Logger(StyleService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly geminiService: GeminiService,
    private readonly storageService: StorageService,
  ) {}

  create(dto: CreateStyleDto) {
    const { imageTypeIds, ...data } = dto;
    return this.prisma.style.create({
      data: {
        ...data,
        imageTypes: imageTypeIds?.length
          ? { connect: imageTypeIds.map((id) => ({ id })) }
          : undefined,
      },
      include: { imageTypes: true },
    });
  }

  async findAll(imageTypeId?: string) {
    const whereClause = imageTypeId
      ? { imageTypes: { some: { id: imageTypeId } } }
      : {};

    const styles = await this.prisma.style.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
      include: {
        imageTypes: true,
        thumbnails: imageTypeId
          ? { where: { imageTypeId }, take: 1 }
          : undefined,
      },
    });

    // If filtering by imageTypeId, use contextual thumbnail if available
    if (imageTypeId) {
      return styles.map((style) => {
        const contextualThumbnail = style.thumbnails?.[0]?.thumbnailUrl;
        return {
          ...style,
          // Use contextual thumbnail if available, otherwise fallback to default
          thumbnailUrl: contextualThumbnail || style.thumbnailUrl,
          thumbnails: undefined, // Don't expose the raw thumbnails array
        };
      });
    }

    return styles;
  }

  async findOne(id: string) {
    const style = await this.prisma.style.findUnique({
      where: { id },
      include: { imageTypes: true },
    });
    if (!style) {
      throw new NotFoundException(`Style ${id} not found`);
    }
    return style;
  }

  async update(id: string, dto: UpdateStyleDto) {
    const { imageTypeIds, ...data } = dto;
    try {
      return await this.prisma.style.update({
        where: { id },
        data: {
          ...data,
          imageTypes:
            imageTypeIds !== undefined
              ? { set: imageTypeIds.map((id) => ({ id })) }
              : undefined,
        },
        include: { imageTypes: true },
      });
    } catch (error) {
      return this.handleNotFound(id, error);
    }
  }

  async remove(id: string) {
    // ✅ string
    try {
      await this.prisma.style.delete({ where: { id } });
    } catch (error) {
      this.handleNotFound(id, error);
    }
  }

  private handleNotFound(id: string, error: unknown) {
    // ✅ string
    if (
      error instanceof Error &&
      'code' in error &&
      (error as any).code === 'P2025'
    ) {
      throw new NotFoundException(`Style ${id} not found`);
    }
    throw error;
  }

  async generateStyleThumbnail(
    dto: GenerateStyleThumbnailDto,
  ): Promise<GenerateStyleThumbnailResponseDto> {
    try {
      // Build prompt with 16:9 aspect ratio instruction
      const prompt = this.buildStyleThumbnailPrompt(dto.imagePrompt);

      this.logger.log(`Generating style thumbnail with prompt: ${prompt}`);

      // Generate image (pure text-to-image, no source image)
      const imageBuffer =
        await this.geminiService.generateImageFromPrompt(prompt);

      // Upload to GCS (PNG since gemini-3-pro-image-preview outputs PNG)
      const filename = `styles/generated/${Date.now()}.png`;
      const url = await this.storageService.uploadBuffer(
        imageBuffer,
        filename,
        'image/png',
      );

      this.logger.log(`Style thumbnail generated and uploaded: ${url}`);

      return {
        success: true,
        generatedImageUrl: url,
        promptUsed: prompt,
      };
    } catch (error) {
      this.logger.error('Style thumbnail generation failed', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private buildStyleThumbnailPrompt(imagePrompt: string): string {
    // The AI-generated prompt already includes quality boosters
    // Just ensure clean formatting
    return imagePrompt.trim().replace(/\.+$/, '') + '.';
  }

  async suggestStylePrompts(
    dto: SuggestStylePromptsDto,
  ): Promise<SuggestStylePromptsResponseDto> {
    this.logger.log(`Suggesting style prompts for: ${dto.description}`);

    try {
      // Fetch available image types for context
      const imageTypes = await this.prisma.imageType.findMany({
        select: { label: true },
      });
      const availableTypes = imageTypes.map((t) => t.label);

      const prompt = this.buildSuggestionPrompt(dto.description, availableTypes);
      const response = await this.geminiService.generateText(prompt);

      // Parse the JSON response
      const suggestions = this.parseSuggestionResponse(response);

      return {
        success: true,
        suggestions,
      };
    } catch (error) {
      this.logger.error('Style prompt suggestion failed', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private buildSuggestionPrompt(
    description: string,
    availableImageTypes: string[],
  ): string {
    return `You are an expert interior design AI assistant for an architectural visualization app called PlanVision.

User wants to create a new design style based on: "${description}"

Available image types in the system: ${availableImageTypes.join(', ')}

Generate 3 DISTINCT style interpretations. Each should offer a different creative direction while staying true to the user's description. For each suggestion, provide:

1. "name": A short, memorable style name (2-4 words)
2. "promptFragment": A detailed description (3-4 sentences) of this design aesthetic. Include:
   - Color palette and materials
   - Furniture and decor style
   - Lighting and atmosphere
   - Key design elements and textures
   This will be used as context when generating images in this style.

3. "suggestedImageTypes": An array of 2-5 image types from the available list that this style best applies to.

4. "imageGenerationPrompt": A highly detailed, specific prompt for generating a thumbnail image that showcases this style. Include:
   - Specific room type or space
   - Exact design elements, furniture pieces, materials
   - Color descriptions
   - Lighting conditions (natural light, warm ambient, etc.)
   - Atmosphere and mood
   - Camera angle/composition (e.g., "wide shot", "corner view")
   - End with: "16:9 aspect ratio, photorealistic architectural visualization, 8k quality"

Make each suggestion meaningfully different - vary the room types, color emphasis, or design interpretation.

Respond ONLY with valid JSON array, no markdown:
[
  {
    "name": "...",
    "promptFragment": "...",
    "suggestedImageTypes": ["...", "..."],
    "imageGenerationPrompt": "..."
  },
  {
    "name": "...",
    "promptFragment": "...",
    "suggestedImageTypes": ["...", "..."],
    "imageGenerationPrompt": "..."
  },
  {
    "name": "...",
    "promptFragment": "...",
    "suggestedImageTypes": ["...", "..."],
    "imageGenerationPrompt": "..."
  }
]`;
  }

  private parseSuggestionResponse(response: string): StyleSuggestion[] {
    try {
      let jsonStr = response.trim();

      // Remove markdown code blocks if present
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr
          .replace(/^```(?:json)?\n?/, '')
          .replace(/\n?```$/, '');
      }

      const parsed = JSON.parse(jsonStr);

      if (!Array.isArray(parsed)) {
        throw new Error('Invalid response format: expected array');
      }

      if (parsed.length !== 3) {
        throw new Error('Expected exactly 3 suggestions');
      }

      return parsed.map(
        (s: {
          name?: string;
          promptFragment?: string;
          suggestedImageTypes?: string[];
          imageGenerationPrompt?: string;
        }) => ({
          name: s.name || 'Untitled Style',
          promptFragment: s.promptFragment || '',
          suggestedImageTypes: s.suggestedImageTypes || [],
          imageGenerationPrompt: s.imageGenerationPrompt || '',
        }),
      );
    } catch (error) {
      this.logger.error('Failed to parse AI response', { response, error });
      throw new Error('Failed to parse AI suggestions');
    }
  }

  async buildImagePrompt(
    dto: BuildImagePromptDto,
  ): Promise<BuildImagePromptResponseDto> {
    this.logger.log(`Building image prompt for style: ${dto.styleName}`);

    try {
      const prompt = this.buildImagePromptGenerationPrompt(
        dto.styleName,
        dto.promptFragment,
        dto.imageTypeLabels || [],
      );

      const response = await this.geminiService.generateText(prompt);

      // Clean up the response - remove quotes if wrapped
      let imagePrompt = response.trim();
      if (
        (imagePrompt.startsWith('"') && imagePrompt.endsWith('"')) ||
        (imagePrompt.startsWith("'") && imagePrompt.endsWith("'"))
      ) {
        imagePrompt = imagePrompt.slice(1, -1);
      }

      return {
        success: true,
        imagePrompt,
      };
    } catch (error) {
      this.logger.error('Image prompt generation failed', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private buildImagePromptGenerationPrompt(
    styleName: string,
    promptFragment: string,
    _imageTypeLabels: string[], // Kept for API compatibility but not used
  ): string {
    return `You are creating an image prompt for a STYLE THUMBNAIL in an interior design app.

STYLE: "${styleName}"
AESTHETIC: "${promptFragment}"

GOAL: Generate a prompt for a style showcase image that will appear in a style picker. Users will see this at thumbnail size (~200px wide) to understand what this style looks like.

THUMBNAIL REQUIREMENTS:
- Compose a VIGNETTE (focused scene with 2-4 key elements), NOT a full room
- Feature characteristic furniture pieces, materials, and textures from this style
- Show the color palette naturally within the scene
- Use lighting that enhances the style's mood
- Create a clear focal point that reads well at small sizes

DO NOT:
- Describe a complete room layout
- Mention specific room types (kitchen, bedroom, living room, etc.)
- Include more than 4-5 main elements
- Use wide establishing shots

PROMPT FORMAT:
Start with the composition type and main elements, then describe materials, textures, colors, and lighting. Be specific about surfaces and finishes.

End the prompt with: "style vignette, 16:9 aspect ratio, interior design photography, 8k, soft directional lighting"

OUTPUT: Only the image generation prompt, nothing else.`;
  }
}

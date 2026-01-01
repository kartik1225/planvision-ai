import { Injectable } from '@nestjs/common';
import { RenderConfig, ImageType, Style } from '@prisma/client';
import { PromptGenerationParams } from './types/prompt-params.interface';

// Define the shape of data we need to build a prompt from RenderConfig
type ConfigWithRelations = RenderConfig & {
  imageType: ImageType;
  style: Style | null;
};

@Injectable()
export class PromptBuilderService {
  /**
   * Build prompt from a RenderConfig with relations (legacy method for backward compatibility)
   */
  buildPrompt(config: ConfigWithRelations): string {
    // Convert ConfigWithRelations to PromptGenerationParams and use shared method
    return this.buildPromptFromParams({
      imageType: {
        label: config.imageType.label,
        value: config.imageType.value,
      },
      style: config.style
        ? { name: config.style.name, promptFragment: config.style.promptFragment }
        : null,
      colorPrimaryHex: config.colorPrimaryHex,
      colorSecondaryHex: config.colorSecondaryHex,
      colorNeutralHex: config.colorNeutralHex,
      perspectiveAngle: config.perspectiveAngle,
      perspectiveX: config.perspectiveX,
      perspectiveY: config.perspectiveY,
      customInstructions: config.customInstructions,
    });
  }

  /**
   * Build prompt from generic parameters (used for template thumbnail generation)
   */
  buildPromptFromParams(params: PromptGenerationParams): string {
    // Check if this is a floor plan with perspective indicator
    const isFloorPlan = params.imageType.value?.includes('floor_plan');
    const hasPerspectiveIndicator =
      isFloorPlan &&
      params.perspectiveAngle !== null &&
      params.perspectiveAngle !== undefined;

    if (hasPerspectiveIndicator) {
      return this.buildFloorPlanPrompt(params);
    }

    return this.buildStandardPrompt(params);
  }

  /**
   * Build prompt for floor plans with visual perspective indicator
   */
  private buildFloorPlanPrompt(params: PromptGenerationParams): string {
    const lines: string[] = [];
    const styleName = params.style?.name ?? 'modern';

    // 1. TASK INSTRUCTION
    lines.push(
      'TASK: Transform this 2D floor plan into a photorealistic 3D interior visualization from the marked camera perspective.',
    );
    lines.push('');

    // 2. CAMERA INDICATOR EXPLANATION
    lines.push('CAMERA POSITION INDICATOR:');
    lines.push(
      '- The blue cone with arrow on the floor plan shows the exact camera/viewer position',
    );
    lines.push(
      '- The arrow direction indicates where the camera is looking',
    );
    lines.push(
      '- Generate a first-person view as if standing at that marked position, looking in the arrow direction',
    );
    lines.push('');

    // 3. SPATIAL INTERPRETATION
    lines.push('SPATIAL RULES:');
    lines.push(
      '- Interpret the floor plan walls, doors, and windows accurately',
    );
    lines.push('- Maintain correct room proportions and ceiling height');
    lines.push(
      '- Position furniture logically based on room function and floor plan layout',
    );
    lines.push('');

    // 4. STYLE TRANSFORMATION
    lines.push(`STYLE TO APPLY: ${styleName}`);
    if (params.style?.promptFragment) {
      lines.push(`Design principles: ${params.style.promptFragment}`);
    }
    lines.push('');

    // 5. COLOR APPLICATION
    if (params.colorPrimaryHex) {
      lines.push('COLOR PALETTE APPLICATION:');
      lines.push(
        `- Primary (${params.colorPrimaryHex}): Feature elements, accent walls, key furniture pieces`,
      );
      if (params.colorSecondaryHex) {
        lines.push(
          `- Secondary (${params.colorSecondaryHex}): Decorative accents, textiles, smaller furniture`,
        );
      }
      if (params.colorNeutralHex) {
        lines.push(
          `- Neutral (${params.colorNeutralHex}): Walls, floors, large surfaces`,
        );
      }
      lines.push('');
    }

    // 6. CUSTOM INSTRUCTIONS
    if (params.customInstructions) {
      lines.push(`ADDITIONAL REQUIREMENTS: ${params.customInstructions}`);
      lines.push('');
    }

    // 7. OUTPUT REQUIREMENTS
    lines.push('OUTPUT REQUIREMENTS:');
    lines.push('- Photorealistic interior photography quality');
    lines.push('- Natural lighting through windows, soft shadows');
    lines.push('- Realistic furniture and material textures');
    lines.push('- Professional architectural visualization, 8K quality');

    return lines.join('\n');
  }

  /**
   * Build standard prompt for non-floor-plan images
   */
  private buildStandardPrompt(params: PromptGenerationParams): string {
    const lines: string[] = [];
    const imageType = params.imageType.label;
    const styleName = params.style?.name ?? 'modern';

    // 1. TASK INSTRUCTION - Clear transformation intent
    lines.push(
      `TASK: Transform this ${imageType.toLowerCase()} photograph into a ${styleName} interior design visualization while preserving the original room structure.`,
    );
    lines.push('');

    // 2. SOURCE IMAGE CONTEXT - What to preserve
    lines.push('PRESERVE FROM SOURCE IMAGE:');
    lines.push(
      '- Exact room layout, dimensions, and architectural structure',
    );
    lines.push('- Window and door positions');
    lines.push('- Camera angle and perspective');
    lines.push('- General placement of major elements');
    lines.push('');

    // 3. STYLE TRANSFORMATION - How to change aesthetics
    lines.push(`STYLE TO APPLY: ${styleName}`);
    if (params.style?.promptFragment) {
      lines.push(`Design principles: ${params.style.promptFragment}`);
    }
    lines.push('');

    // 4. COLOR APPLICATION - Where to apply colors
    if (params.colorPrimaryHex) {
      lines.push('COLOR PALETTE APPLICATION:');
      lines.push(
        `- Primary (${params.colorPrimaryHex}): Feature elements, accent walls, key furniture pieces`,
      );
      if (params.colorSecondaryHex) {
        lines.push(
          `- Secondary (${params.colorSecondaryHex}): Decorative accents, textiles, smaller furniture`,
        );
      }
      if (params.colorNeutralHex) {
        lines.push(
          `- Neutral (${params.colorNeutralHex}): Walls, floors, large surfaces, background elements`,
        );
      }
      lines.push('');
    }

    // 5. CUSTOM INSTRUCTIONS
    if (params.customInstructions) {
      lines.push(`ADDITIONAL REQUIREMENTS: ${params.customInstructions}`);
      lines.push('');
    }

    // 6. OUTPUT REQUIREMENTS
    lines.push('OUTPUT REQUIREMENTS:');
    lines.push(
      '- Photorealistic interior photography quality',
    );
    lines.push('- Natural lighting with soft shadows');
    lines.push('- Professional architectural visualization');
    lines.push('- 8K resolution, detailed textures and materials');

    return lines.join('\n');
  }
}

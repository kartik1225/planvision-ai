/**
 * Shared interface for prompt generation parameters.
 * Used by both RenderConfig-based generation and template thumbnail generation.
 */
export interface PromptGenerationParams {
  // Required: Image type information
  imageType: {
    label: string;
    value?: string; // e.g., "floor_plan_2d", "kitchen", etc.
  };

  // Optional: Style information
  style?: {
    name: string;
    promptFragment: string;
  } | null;

  // Optional: Color customization
  colorPrimaryHex?: string | null;
  colorSecondaryHex?: string | null;
  colorNeutralHex?: string | null;

  // Optional: Perspective/camera settings
  perspectiveAngle?: number | null;
  perspectiveX?: number | null;
  perspectiveY?: number | null;

  // Optional: Custom instructions
  customInstructions?: string | null;
}

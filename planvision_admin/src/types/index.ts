export interface User {
  id: string;
  email: string;
  name: string;
  image: string | null;
  emailVerified: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
  redirect: boolean;
}

export interface ImageType {
  id: string;
  label: string;
  value: string;
  description: string;
}

export interface Style {
  id: string;
  name: string;
  thumbnailUrl: string;
  promptFragment?: string;
  imageTypes?: ImageType[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectTemplate {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string;
  originalThumbnailUrl?: string | null;
  generatedThumbnailUrl?: string | null;
  sampleImageUrls: string[];
  defaultImageTypeId: string;
  defaultImageType?: ImageType;
  defaultStyleId?: string | null;
  defaultStyle?: Style | null;
  generationOptions?: GenerationOptions | null;
  createdAt: string;
  updatedAt: string;
}

export interface GenerationOptions {
  styleId?: string;
  colorPrimaryHex?: string;
  colorSecondaryHex?: string;
  colorNeutralHex?: string;
  perspectiveAngle?: number;
  perspectiveX?: number;
  perspectiveY?: number;
  customInstructions?: string;
}

export interface CreateTemplateDto {
  title: string;
  description?: string;
  thumbnailUrl: string;
  originalThumbnailUrl?: string;
  generatedThumbnailUrl?: string;
  sampleImageUrls: string[];
  defaultImageTypeId: string;
  defaultStyleId?: string;
  generationOptions?: GenerationOptions;
}

export interface TemplateSuggestion {
  title: string;
  description: string;
  imageTypeId: string;
  imageTypeLabel: string;
  sampleImageKeywords: string[];
}

export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  alt: string;
}

export interface SearchPexelsParams {
  query: string;
  page?: number;
  perPage?: number;
  orientation?: 'landscape' | 'portrait' | 'square';
}

export interface SearchPexelsResponse {
  totalResults: number;
  page: number;
  perPage: number;
  photos: PexelsPhoto[];
}

export interface SuggestTemplateResponse {
  suggestions: TemplateSuggestion[];
}

export interface GenerateThumbnailParams {
  sourceImageUrl: string;
  imageTypeId: string;
  styleId: string;
  colorPrimaryHex?: string;
  colorSecondaryHex?: string;
  colorNeutralHex?: string;
  perspectiveAngle?: number;
  perspectiveX?: number;
  perspectiveY?: number;
  customInstructions?: string;
}

export interface GenerateThumbnailResult {
  success: boolean;
  generatedImageUrl?: string;
  promptUsed?: string;
  errorMessage?: string;
}

export interface CreateStyleDto {
  name: string;
  thumbnailUrl: string;
  promptFragment: string;
  imageTypeIds?: string[];
}

export interface UpdateStyleDto {
  name?: string;
  thumbnailUrl?: string;
  promptFragment?: string;
  imageTypeIds?: string[];
}

export interface GenerateStyleThumbnailParams {
  imagePrompt: string;
}

export interface GenerateStyleThumbnailResult {
  success: boolean;
  generatedImageUrl?: string;
  promptUsed?: string;
  errorMessage?: string;
}

export interface StyleSuggestion {
  name: string;
  promptFragment: string;
  suggestedImageTypes: string[];
  imageGenerationPrompt: string;
}

export interface SuggestStylePromptsParams {
  description: string;
}

export interface SuggestStylePromptsResult {
  success: boolean;
  suggestions?: StyleSuggestion[];
  errorMessage?: string;
}

export interface BuildImagePromptParams {
  styleName: string;
  promptFragment: string;
  imageTypeLabels?: string[];
}

export interface BuildImagePromptResult {
  success: boolean;
  imagePrompt?: string;
  errorMessage?: string;
}

// Pixabay types
export interface PixabayImage {
  id: number;
  pageURL: string;
  tags: string;
  previewURL: string;
  webformatURL: string;
  largeImageURL: string;
  imageWidth: number;
  imageHeight: number;
  user: string;
  userImageURL: string;
}

export interface SearchPixabayParams {
  query: string;
  page?: number;
  perPage?: number;
  imageType?: 'all' | 'photo' | 'illustration' | 'vector';
}

export interface SearchPixabayResponse {
  total: number;
  totalHits: number;
  hits: PixabayImage[];
}

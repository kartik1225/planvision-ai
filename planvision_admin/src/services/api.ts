import type {
  AuthResponse,
  ImageType,
  ProjectTemplate,
  CreateTemplateDto,
  SuggestTemplateResponse,
  Style,
  GenerateThumbnailParams,
  GenerateThumbnailResult,
  CreateStyleDto,
  UpdateStyleDto,
  GenerateStyleThumbnailParams,
  GenerateStyleThumbnailResult,
  SuggestStylePromptsParams,
  SuggestStylePromptsResult,
  BuildImagePromptParams,
  BuildImagePromptResult,
  SearchPexelsParams,
  SearchPexelsResponse,
  SearchPixabayParams,
  SearchPixabayResponse,
} from '../types';

const API_BASE_URL = 'http://localhost:3000';

async function fetchWithCredentials<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  signIn: (email: string, password: string): Promise<AuthResponse> => {
    return fetchWithCredentials('/api/auth/sign-in/email', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  signOut: (): Promise<void> => {
    return fetchWithCredentials('/api/auth/sign-out', {
      method: 'POST',
    });
  },

  // Image Types
  getImageTypes: (): Promise<ImageType[]> => {
    return fetchWithCredentials('/image-types');
  },

  // Styles
  getStyles: (): Promise<Style[]> => {
    return fetchWithCredentials('/styles');
  },

  createStyle: (data: CreateStyleDto): Promise<Style> => {
    return fetchWithCredentials('/styles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateStyle: (id: string, data: UpdateStyleDto): Promise<Style> => {
    return fetchWithCredentials(`/styles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteStyle: (id: string): Promise<void> => {
    return fetchWithCredentials(`/styles/${id}`, {
      method: 'DELETE',
    });
  },

  suggestStylePrompts: (params: SuggestStylePromptsParams): Promise<SuggestStylePromptsResult> => {
    return fetchWithCredentials('/styles/suggest-prompts', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  generateStyleThumbnail: (params: GenerateStyleThumbnailParams): Promise<GenerateStyleThumbnailResult> => {
    return fetchWithCredentials('/styles/generate-thumbnail', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  buildImagePrompt: (params: BuildImagePromptParams): Promise<BuildImagePromptResult> => {
    return fetchWithCredentials('/styles/build-image-prompt', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Project Templates
  getTemplates: (): Promise<ProjectTemplate[]> => {
    return fetchWithCredentials('/project-templates');
  },

  createTemplate: (data: CreateTemplateDto): Promise<ProjectTemplate> => {
    return fetchWithCredentials('/project-templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteTemplate: (id: string): Promise<void> => {
    return fetchWithCredentials(`/project-templates/${id}`, {
      method: 'DELETE',
    });
  },

  uploadTemplateAsset: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/project-templates/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
      // Don't set Content-Type header - browser will set it with boundary for multipart
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  },

  suggestTemplates: (description: string): Promise<SuggestTemplateResponse> => {
    return fetchWithCredentials('/project-templates/suggest', {
      method: 'POST',
      body: JSON.stringify({ description }),
    });
  },

  generateThumbnail: (params: GenerateThumbnailParams): Promise<GenerateThumbnailResult> => {
    return fetchWithCredentials('/project-templates/generate-thumbnail', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  searchPexelsImages: (params: SearchPexelsParams): Promise<SearchPexelsResponse> => {
    const searchParams = new URLSearchParams({ query: params.query });
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.perPage) searchParams.append('perPage', params.perPage.toString());
    if (params.orientation) searchParams.append('orientation', params.orientation);

    return fetchWithCredentials(`/project-templates/search-images?${searchParams.toString()}`);
  },

  searchPixabayImages: (params: SearchPixabayParams): Promise<SearchPixabayResponse> => {
    const searchParams = new URLSearchParams({ query: params.query });
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.perPage) searchParams.append('perPage', params.perPage.toString());
    if (params.imageType) searchParams.append('imageType', params.imageType);

    return fetchWithCredentials(`/project-templates/search-pixabay?${searchParams.toString()}`);
  },
};

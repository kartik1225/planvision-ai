import { Injectable, Logger } from '@nestjs/common';

export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
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

export interface PexelsSearchResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  next_page?: string;
}

@Injectable()
export class PexelsService {
  private readonly logger = new Logger(PexelsService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.pexels.com/v1';

  // 16:9 aspect ratio = 1.778
  private readonly TARGET_RATIO = 16 / 9;
  private readonly RATIO_TOLERANCE = 0.15; // Allow 15% deviation from 16:9

  constructor() {
    this.apiKey = process.env.PEXELS_API_KEY || '';
    if (!this.apiKey) {
      this.logger.warn('PEXELS_API_KEY not configured');
    }
  }

  private isNear16by9(width: number, height: number): boolean {
    const ratio = width / height;
    return Math.abs(ratio - this.TARGET_RATIO) <= this.RATIO_TOLERANCE;
  }

  async searchPhotos(
    query: string,
    page = 1,
    perPage = 15,
    orientation?: 'landscape' | 'portrait' | 'square',
  ): Promise<PexelsSearchResponse> {
    if (!this.apiKey) {
      throw new Error('Pexels API key not configured');
    }

    // Request more images than needed since we'll filter for 16:9
    const fetchPerPage = Math.min(perPage * 3, 80); // Pexels max is 80

    const params = new URLSearchParams({
      query,
      page: page.toString(),
      per_page: fetchPerPage.toString(),
    });

    // Always use landscape for 16:9
    params.append('orientation', 'landscape');

    const url = `${this.baseUrl}/search?${params.toString()}`;
    this.logger.log(`Searching Pexels: "${query}" (page ${page}, fetching ${fetchPerPage})`);

    const response = await fetch(url, {
      headers: {
        Authorization: this.apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Pexels API error: ${response.status} - ${error}`);
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data = (await response.json()) as PexelsSearchResponse;

    // Filter for 16:9 aspect ratio images
    const filtered16by9 = data.photos.filter((photo) =>
      this.isNear16by9(photo.width, photo.height),
    );

    this.logger.log(
      `Found ${data.total_results} total, ${filtered16by9.length} near 16:9 for "${query}"`,
    );

    // Return only the requested number of filtered results
    return {
      ...data,
      photos: filtered16by9.slice(0, perPage),
      per_page: perPage,
    };
  }
}

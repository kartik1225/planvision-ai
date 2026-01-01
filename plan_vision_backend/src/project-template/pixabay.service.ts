import { Injectable, Logger } from '@nestjs/common';

export interface PixabayImage {
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  previewURL: string;
  previewWidth: number;
  previewHeight: number;
  webformatURL: string;
  webformatWidth: number;
  webformatHeight: number;
  largeImageURL: string;
  imageWidth: number;
  imageHeight: number;
  imageSize: number;
  views: number;
  downloads: number;
  collections: number;
  likes: number;
  comments: number;
  user_id: number;
  user: string;
  userImageURL: string;
}

export interface PixabaySearchResponse {
  total: number;
  totalHits: number;
  hits: PixabayImage[];
}

@Injectable()
export class PixabayService {
  private readonly logger = new Logger(PixabayService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://pixabay.com/api';

  // 16:9 aspect ratio = 1.778
  private readonly TARGET_RATIO = 16 / 9;
  private readonly RATIO_TOLERANCE = 0.15; // Allow 15% deviation from 16:9

  constructor() {
    this.apiKey = process.env.PIXABAY_API_KEY || '';
    if (!this.apiKey) {
      this.logger.warn('PIXABAY_API_KEY not configured');
    }
  }

  private isNear16by9(width: number, height: number): boolean {
    const ratio = width / height;
    return Math.abs(ratio - this.TARGET_RATIO) <= this.RATIO_TOLERANCE;
  }

  async searchImages(
    query: string,
    page = 1,
    perPage = 15,
    imageType: 'all' | 'photo' | 'illustration' | 'vector' = 'photo',
    orientation: 'all' | 'horizontal' | 'vertical' = 'horizontal',
  ): Promise<PixabaySearchResponse> {
    if (!this.apiKey) {
      throw new Error('Pixabay API key not configured');
    }

    // Request more images than needed since we'll filter for 16:9
    const fetchPerPage = Math.min(perPage * 3, 200); // Pixabay max is 200

    const params = new URLSearchParams({
      key: this.apiKey,
      q: query,
      page: page.toString(),
      per_page: fetchPerPage.toString(),
      image_type: imageType,
      orientation: 'horizontal', // Always horizontal for 16:9
      safesearch: 'true',
    });

    const url = `${this.baseUrl}/?${params.toString()}`;
    this.logger.log(`Searching Pixabay: "${query}" (page ${page}, fetching ${fetchPerPage})`);

    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Pixabay API error: ${response.status} - ${error}`);
      throw new Error(`Pixabay API error: ${response.status}`);
    }

    const data = (await response.json()) as PixabaySearchResponse;

    // Filter for 16:9 aspect ratio images
    const filtered16by9 = data.hits.filter((image) =>
      this.isNear16by9(image.imageWidth, image.imageHeight),
    );

    this.logger.log(
      `Found ${data.totalHits} total, ${filtered16by9.length} near 16:9 for "${query}"`,
    );

    // Return only the requested number of filtered results
    return {
      total: data.total,
      totalHits: data.totalHits,
      hits: filtered16by9.slice(0, perPage),
    };
  }
}

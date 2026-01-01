import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private ai: GoogleGenAI;

  constructor(private readonly storageService: StorageService) {
    const projectId = process.env.GCP_PROJECT_ID;
    const location = process.env.GCP_LOCATION ?? 'us-central1';

    if (!projectId) {
      throw new Error('GCP_PROJECT_ID is required in .env');
    }

    // Using Vertex AI with project credentials
    // TODO: Switch to AI Studio (GEMINI_API_KEY) once billing propagates
    this.ai = new GoogleGenAI({
      vertexai: true,
      project: projectId,
      location: location,
    });
    this.logger.log(`GeminiService initialized with Vertex AI (project: ${projectId}, location: ${location})`);
  }

  async generateImage(
    prompt: string,
    inputImageUrl: string,
  ): Promise<Buffer | null> {
    this.logger.log(
      `Generating Image with prompt: ${prompt.substring(0, 50)}...`,
    );

    try {
      // 1. Fetch and Convert Input Image
      this.logger.log(`Downloading input image from: ${inputImageUrl}`);
      const imageResp = await fetch(inputImageUrl);

      if (!imageResp.ok) {
        throw new Error(
          `Failed to fetch reference image: ${imageResp.statusText}`,
        );
      }

      // 2. Robust Mime Type Detection
      const rawType = imageResp.headers.get('content-type');
      // Split to handle "image/jpeg; charset=utf-8" -> "image/jpeg"
      let mimeType = rawType ? rawType.split(';')[0].trim() : '';

      // Fallback if empty or invalid
      if (!mimeType || mimeType === 'application/octet-stream') {
        mimeType = 'image/jpeg';
      }

      this.logger.log(`Using MimeType: ${mimeType}`);

      const arrayBuffer = await imageResp.arrayBuffer();
      const base64Image = Buffer.from(arrayBuffer).toString('base64');

      // 3. Call Model (Using Explicit Structure)
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType, // Now guaranteed to be a string like 'image/jpeg'
                  data: base64Image,
                },
              },
            ],
          },
        ],
      });

      // 4. Parse Response
      const candidate = response.candidates?.[0];
      if (!candidate?.content?.parts) {
        throw new Error('No content received from model.');
      }

      for (const part of candidate.content.parts) {
        if (part.text) {
          this.logger.warn(`Model returned text: ${part.text}`);
        }
        if (part.inlineData && part.inlineData.data) {
          this.logger.log('✅ Image data received successfully.');
          return Buffer.from(part.inlineData.data, 'base64');
        }
      }

      throw new Error('Model finished but returned no image data.');
    } catch (error) {
      this.logger.error('AI Generation Failed', error);
      throw error;
    }
  }

  async generateText(prompt: string): Promise<string> {
    this.logger.log(`Generating text with prompt: ${prompt.substring(0, 100)}...`);

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        config: {
          maxOutputTokens: 8192,
          temperature: 0.9,
        },
      });

      const candidate = response.candidates?.[0];
      if (!candidate?.content?.parts) {
        throw new Error('No content received from model.');
      }

      const textPart = candidate.content.parts.find((p) => p.text);
      if (!textPart?.text) {
        throw new Error('No text response from model.');
      }

      return textPart.text;
    } catch (error) {
      this.logger.error('AI Text Generation Failed', error);
      throw error;
    }
  }

  /**
   * Generate an image purely from a text prompt (no source image).
   * Used for style thumbnail generation.
   * Uses gemini-2.5-flash-image model via AI Studio.
   * Note: Include aspect ratio requirements in the prompt itself.
   */
  async generateImageFromPrompt(prompt: string): Promise<Buffer> {
    this.logger.log(
      `Generating image from prompt: ${prompt.substring(0, 100)}...`,
    );

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        config: {
          temperature: 1,
          topP: 0.95,
          maxOutputTokens: 8192,
          responseModalities: ['IMAGE'],
        },
      });

      const candidate = response.candidates?.[0];
      if (!candidate?.content?.parts) {
        throw new Error('No content received from model.');
      }

      // Look for image data in the response
      for (const part of candidate.content.parts) {
        if (part.text) {
          this.logger.warn(`Model returned text: ${part.text}`);
        }
        if (part.inlineData && part.inlineData.data) {
          this.logger.log('Image data received successfully.');
          return Buffer.from(part.inlineData.data, 'base64');
        }
      }

      throw new Error('Model finished but returned no image data.');
    } catch (error) {
      this.logger.error('AI Image From Prompt Generation Failed', error);
      throw error;
    }
  }
}

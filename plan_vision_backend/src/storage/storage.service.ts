import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';

@Injectable()
export class StorageService {
  private readonly bucketName: string;
  private readonly storage: Storage;
  private readonly publicUrlPrefix: string;

  constructor() {
    this.bucketName = process.env.GCS_BUCKET ?? '';
    if (!this.bucketName) {
      throw new Error('GCS_BUCKET is required');
    }

    const projectId = process.env.GCP_PROJECT_ID;
    if (!projectId) {
      throw new Error('GCP_PROJECT_ID is required in .env');
    }

    // AUTOMATIC AUTH:
    // By not passing 'credentials', the Storage SDK automatically looks
    // for your "gcloud auth application-default" credentials.
    this.storage = new Storage({
      projectId: projectId,
    });

    const customDomain = process.env.GCS_PUBLIC_DOMAIN;
    this.publicUrlPrefix = customDomain
      ? customDomain.replace(/\/$/, '') + '/'
      : `https://storage.googleapis.com/${this.bucketName}/`;
  }

  async uploadFile(file: Express.Multer.File, destination?: string) {
    const bucket = this.storage.bucket(this.bucketName);
    const objectName = destination ?? `${Date.now()}-${file.originalname}`;
    const blob = bucket.file(objectName);

    await blob.save(file.buffer, {
      contentType: file.mimetype,
      resumable: false,
    });

    return { objectName };
  }

  async uploadBuffer(
    buffer: Buffer,
    destination: string,
    contentType: string,
  ): Promise<string> {
    const bucket = this.storage.bucket(this.bucketName);
    const blob = bucket.file(destination);

    await blob.save(buffer, {
      contentType,
      resumable: false,
    });

    return this.getPublicUrl(destination);
  }

  async getSignedUrl(objectName: string, expiresInSeconds = 3600) {
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(objectName);
    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + expiresInSeconds * 1000,
    });
    return url;
  }

  getPublicUrl(objectName: string) {
    return `${this.publicUrlPrefix}${objectName}`;
  }

  extractObjectName(urlOrObjectName: string) {
    if (urlOrObjectName.startsWith(this.publicUrlPrefix)) {
      return urlOrObjectName.substring(this.publicUrlPrefix.length);
    }
    return urlOrObjectName;
  }
}

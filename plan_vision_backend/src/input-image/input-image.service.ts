import { Injectable, NotFoundException } from '@nestjs/common';
import type { Express } from 'express';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInputImageDto } from './dto/create-input-image.dto';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class InputImageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async create(dto: CreateInputImageDto, session: UserSession) {
    return this.prisma.inputImage.create({
      data: {
        userId: session.user.id,
        url: dto.url,
      },
    });
  }

  async findAll(session: UserSession) {
    return this.prisma.inputImage.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createFromUpload(file: Express.Multer.File, session: UserSession) {
    const stored = await this.storage.uploadFile(file);
    return this.prisma.inputImage.create({
      data: {
        userId: session.user.id,

        url: this.storage.getPublicUrl(stored.objectName),
      },
    });
  }

  async getSignedUrl(id: string, session: UserSession) {
    const record = await this.findOne(id, session);
    return this.storage.getSignedUrl(
      this.storage.extractObjectName(record.url),
    );
  }

  async findOne(id: string, session: UserSession) {
    const image = await this.prisma.inputImage.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!image) {
      throw new NotFoundException(`Input image ${id} not found`);
    }
    return image;
  }

  async remove(id: string, session: UserSession) {
    const image = await this.prisma.inputImage.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!image) {
      throw new NotFoundException(`Input image ${id} not found`);
    }
    await this.prisma.inputImage.delete({ where: { id } });
  }
}

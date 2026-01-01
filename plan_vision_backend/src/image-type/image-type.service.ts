import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateImageTypeDto } from './dto/create-image-type.dto';
import { UpdateImageTypeDto } from './dto/update-image-type.dto';

@Injectable()
export class ImageTypeService {
  constructor(private readonly prisma: PrismaService) { }

  create(dto: CreateImageTypeDto) {
    return this.prisma.imageType.create({ data: dto });
  }

  async findAll() {
    return this.prisma.imageType.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.imageType.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException('ImageType not found');
    }
    return record;
  }

  async update(id: string, dto: UpdateImageTypeDto) {
    await this.findOne(id);
    try {
      return await this.prisma.imageType.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      return this.handleNotFound(id, error);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      await this.prisma.imageType.delete({ where: { id } });
      return { message: 'ImageType deleted successfully' };
    } catch (error) {
      this.handleNotFound(id, error);
    }
  }

  private handleNotFound(id: string, error: unknown) {
    if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') {
      throw new NotFoundException(`Image type ${id} not found`);
    }
    throw error;
  }
}

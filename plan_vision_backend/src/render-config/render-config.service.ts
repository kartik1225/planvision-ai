import { Injectable, NotFoundException } from '@nestjs/common';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRenderConfigDto } from './dto/create-render-config.dto';
import { UpdateRenderConfigDto } from './dto/update-render-config.dto';

@Injectable()
export class RenderConfigService {
  constructor(private readonly prisma: PrismaService) {}

  // ✅ projectId is now string
  private async assertProjectOwnership(projectId: string, session: UserSession) {
    const email = session?.user?.email;
    if (!email) {
      throw new NotFoundException('Session missing email');
    }
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('User profile not found');
    }
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, userId: user.id },
    });
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found for user`);
    }
    return project;
  }

  async create(dto: CreateRenderConfigDto, session: UserSession) {
    await this.assertProjectOwnership(dto.projectId, session);
    // ✅ Types now match
    return this.prisma.renderConfig.create({ data: dto });
  }

  async findAllByProject(projectId: string, session: UserSession) { // ✅ string
    await this.assertProjectOwnership(projectId, session);
    return this.prisma.renderConfig.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, session: UserSession) { // ✅ string
    const record = await this.prisma.renderConfig.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException(`Render config ${id} not found`);
    }
    await this.assertProjectOwnership(record.projectId, session);
    return record;
  }

  async update(id: string, dto: UpdateRenderConfigDto, session: UserSession) { // ✅ string
    const existing = await this.findOne(id, session);
    return this.prisma.renderConfig.update({ where: { id: existing.id }, data: dto });
  }

  async remove(id: string, session: UserSession) { // ✅ string
    await this.findOne(id, session);
    await this.prisma.renderConfig.delete({ where: { id } });
  }
}

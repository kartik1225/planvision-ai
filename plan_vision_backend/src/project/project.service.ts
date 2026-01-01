import { Injectable, NotFoundException } from '@nestjs/common';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) { }

  private resolveOwner(session: UserSession) {
    if (!session?.user?.email) {
      throw new NotFoundException(
        'Session missing email for ownership resolution',
      );
    }
    return session.user.email;
  }

  async create(dto: CreateProjectDto, session: UserSession) {
    return this.prisma.project.create({
      data: {
        userId: session.user.id,
        name: dto.name,
      },
    });
  }

  async findAll(session: UserSession) {
    return this.prisma.project.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(session: UserSession, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }
    return project;
  }

  async update(id: string, dto: UpdateProjectDto, session: UserSession) {
    const project = await this.findOne(session, id);

    return this.prisma.project.update({
      where: { id: project.id },
      data: dto,
    });
  }

  async remove(id: string, session: UserSession) {
    const project = await this.prisma.project.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }
    await this.prisma.project.delete({ where: { id } });
  }
}

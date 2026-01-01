import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ImageTypeController } from './image-type.controller';
import { ImageTypeService } from './image-type.service';

@Module({
  imports: [PrismaModule],
  controllers: [ImageTypeController],
  providers: [ImageTypeService],
})
export class ImageTypeModule {}

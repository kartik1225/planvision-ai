import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { InputImageController } from './input-image.controller';
import { InputImageService } from './input-image.service';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [InputImageController],
  providers: [InputImageService],
})
export class InputImageModule {}

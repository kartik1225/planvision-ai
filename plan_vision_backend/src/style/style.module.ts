import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { GenerationModule } from '../generation/generation.module';
import { StorageModule } from '../storage/storage.module';
import { StyleController } from './style.controller';
import { StyleService } from './style.service';

@Module({
  imports: [PrismaModule, GenerationModule, StorageModule],
  controllers: [StyleController],
  providers: [StyleService],
})
export class StyleModule {}

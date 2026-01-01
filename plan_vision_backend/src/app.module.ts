import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthFeatureModule } from './auth/auth.module';
import { auth } from './auth/auth.config';
import { ImageTypeModule } from './image-type/image-type.module';
import { InputImageModule } from './input-image/input-image.module'; // Uncommented
import { PrismaModule } from './prisma/prisma.module';
import { ProjectModule } from './project/project.module';
import { RenderConfigModule } from './render-config/render-config.module'; // Uncommented
import { StyleModule } from './style/style.module'; // Uncommented
import { UserModule } from './user/user.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { ProjectTemplateModule } from './project-template/project-template.module';
import { StorageModule } from './storage/storage.module';
import { AuthMiddleware } from './common/middleware/auth.middleware'; // Import
import { GenerationModule } from './generation/generation.module';

@Module({
  imports: [
    AuthModule.forRoot({ auth }),
    AuthFeatureModule,
    PrismaModule,
    UserModule,
    ImageTypeModule,
    StyleModule,
    ProjectModule,
    InputImageModule,
    RenderConfigModule,
    StorageModule,
    ProjectTemplateModule,
    GenerationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');

    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

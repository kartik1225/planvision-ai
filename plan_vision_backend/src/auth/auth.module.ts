import { Module } from '@nestjs/common';
import { AuthDocsController } from './auth.docs.controller';

@Module({
  controllers: [AuthDocsController],
})
export class AuthFeatureModule {}

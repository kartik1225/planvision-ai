import { PartialType } from '@nestjs/swagger';
import { CreateRenderConfigDto } from './create-render-config.dto';

export class UpdateRenderConfigDto extends PartialType(CreateRenderConfigDto) {}

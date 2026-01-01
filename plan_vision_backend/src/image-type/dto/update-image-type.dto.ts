import { PartialType } from '@nestjs/swagger';
import { CreateImageTypeDto } from './create-image-type.dto';

export class UpdateImageTypeDto extends PartialType(CreateImageTypeDto) {}

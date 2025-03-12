import { InputType } from '@nestjs/graphql';
import { ResourceParams } from './resource.input';

@InputType()
export class ResourceCreateParams extends ResourceParams {}

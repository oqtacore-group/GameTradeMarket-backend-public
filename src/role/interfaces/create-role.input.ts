import { InputType } from '@nestjs/graphql';
import { RoleParams } from './role.input';

@InputType()
export class RoleCreateParams extends RoleParams {}

import { Field, InputType } from '@nestjs/graphql';
import { RoleCreateParams } from './create-role.input';

@InputType()
export class RoleUpdateParams extends RoleCreateParams {
  @Field(() => String)
  newCode: string;
}

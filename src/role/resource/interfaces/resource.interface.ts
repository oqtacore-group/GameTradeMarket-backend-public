import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class RoleResourcesParams {
  @Field(() => ID)
  roleCode: string;
  @Field(() => [String], { nullable: true })
  resources?: string[];
}

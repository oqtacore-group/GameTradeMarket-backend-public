import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class RoleParams {
  @Field(() => ID, {
    nullable: true,
    description: 'Unique identifier',
  })
  code: string;
  @Field(() => String, {
    nullable: true,
    description: 'Role name',
  })
  name: string;
}

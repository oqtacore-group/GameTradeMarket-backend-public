import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Role {
  @Field(() => String)
  code: string;
  @Field(() => String)
  name: string;
}

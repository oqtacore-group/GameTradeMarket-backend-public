import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserRole {
  @Field(() => String)
  code: string;
}

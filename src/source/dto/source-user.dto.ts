import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType()
export class PublisherUsers {
  @Field(() => ID)
  user_id: string;

  @Field(() => String, { nullable: true })
  email: string;
}

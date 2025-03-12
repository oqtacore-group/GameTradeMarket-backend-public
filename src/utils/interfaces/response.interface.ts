import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Success {
  @Field(() => String)
  message: string;
  @Field(() => String)
  code: string;
}

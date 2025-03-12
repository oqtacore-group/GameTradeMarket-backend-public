import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class CountItems {
  @Field(() => Int)
  total: number;
}

import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class CountLogs {
  @Field(() => Int)
  total: number;
}

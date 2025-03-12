import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserActionStatDto {
  @Field(() => Int)
  actionId: number;
  @Field(() => String)
  actionName: string;
  @Field(() => Int)
  limit: number;
  @Field(() => Int)
  amount: number;
  @Field(() => Boolean)
  isInfinity: boolean;
  @Field(() => Int)
  count: number;
  @Field(() => Int, { defaultValue: 0 })
  bonuses: number;
}

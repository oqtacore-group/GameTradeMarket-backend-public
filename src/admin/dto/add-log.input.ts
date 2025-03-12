import { Field, Int } from '@nestjs/graphql';

export class LogParams {
  @Field(() => Int)
  readonly offset: number;

  @Field(() => Int)
  readonly first: number;
}

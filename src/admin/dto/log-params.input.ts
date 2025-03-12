import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class LogParams {
  @Field(() => Int)
  readonly offset: number;

  @Field(() => Int)
  readonly first: number;
}

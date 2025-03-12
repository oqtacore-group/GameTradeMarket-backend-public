import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Log {
  @Field(() => String)
  createAt: Date;

  @Field(() => String)
  eventName: string;

  @Field(() => String)
  context: string;

  @Field(() => String, { nullable: true })
  response?: string;

  @Field(() => Int)
  duration: number;
}

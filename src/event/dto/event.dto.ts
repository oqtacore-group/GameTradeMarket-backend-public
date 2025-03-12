import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class MarkAsReadNotifyArgs {
  @Field(() => Int)
  id: number;
}

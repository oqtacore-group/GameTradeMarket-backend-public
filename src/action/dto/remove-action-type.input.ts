import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class RemoveActionTypeInput {
  @Field(() => ID)
  readonly id: number;
}

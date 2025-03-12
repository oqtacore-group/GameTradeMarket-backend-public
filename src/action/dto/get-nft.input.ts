import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class GetNftInput {
  @Field(() => String)
  readonly userId: string;
}

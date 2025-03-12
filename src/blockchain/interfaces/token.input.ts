import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class TokenInfoParams {
  @Field(() => String)
  token_value: string;
  @Field(() => String)
  contract: string;
}

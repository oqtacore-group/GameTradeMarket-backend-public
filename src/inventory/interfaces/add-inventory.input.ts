import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class AddInventoryParams {
  @Field(() => String)
  contract: string;
  @Field(() => String)
  token_value: string;
  @Field(() => String)
  game_code: string;
}

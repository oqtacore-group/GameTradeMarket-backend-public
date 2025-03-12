import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class RemoveInventoryParams {
  @Field(() => String)
  contract: string;
  @Field(() => String)
  token_value: string;
}

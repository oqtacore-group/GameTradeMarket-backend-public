import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class DisconnectWalletArgs {
  @Field(() => String)
  address: string;
}

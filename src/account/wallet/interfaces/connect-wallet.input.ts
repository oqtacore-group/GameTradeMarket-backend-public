import { Field, InputType } from '@nestjs/graphql';
import { WalletProvider } from '../models/wallet.entity';

@InputType()
export class WalletParams {
  @Field(() => String)
  address: string;
  @Field(() => String)
  name: string;
  @Field(() => WalletProvider)
  provider: WalletProvider;
}

@InputType()
export class WalletUpdateParams {
  @Field(() => String)
  address: string;
  @Field(() => String)
  name: string;
}

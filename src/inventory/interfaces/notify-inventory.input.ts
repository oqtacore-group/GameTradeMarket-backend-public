import { Field, InputType } from '@nestjs/graphql';
import { Blockchain } from '../../blockchain/interfaces/blockchain.interface';

@InputType()
export class NotifyInventoryParams {
  @Field(() => String)
  contract: string;
  @Field(() => String)
  token_value: string;
  @Field(() => String)
  blockchain: Blockchain;
}

import { Field, InputType } from '@nestjs/graphql';
import { Blockchain } from '../../blockchain/interfaces/blockchain.interface';

@InputType({ description: 'Add contract' })
export class ContractCreateInput {
  @Field(() => String, { description: 'Contract ID' })
  readonly contract: string;
  @Field(() => String, { description: 'Game code' })
  readonly source: string;
  @Field(() => String, { description: 'Blockchain' })
  readonly blockchain: Blockchain;
  @Field(() => Boolean, {
    description: 'Test contract',
    defaultValue: false,
  })
  readonly is_test: boolean;
}

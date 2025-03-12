import { InterfaceType, Field, Int, ObjectType } from '@nestjs/graphql';

@InterfaceType({ isAbstract: true })
export class ITokenTransfer {
  @Field(() => String)
  token_address: string;
  @Field(() => String)
  from_address: string;
  @Field(() => String)
  to_address: string;
  @Field(() => String)
  value: string;
  @Field(() => String)
  transaction_hash: string;
  @Field(() => Int)
  log_index: number;
  @Field(() => String)
  block_timestamp: string;
  @Field(() => Int)
  block_number: number;
  @Field(() => String)
  block_hash: string;
}

@ObjectType()
export class TokenTransfer {
  @Field(() => String)
  value: string;
  @Field(() => String)
  token_address: string;
  @Field(() => String)
  from_address: string;
  @Field(() => String)
  block_timestamp: string;
  @Field(() => Int)
  block_number: number;
  @Field(() => String)
  blockchain: string;
  @Field(() => String, { nullable: true })
  token_uri: string;
}

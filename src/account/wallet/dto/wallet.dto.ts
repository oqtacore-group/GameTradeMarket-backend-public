import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Currency } from './currency.dto';

@ObjectType()
export class Wallet {
  @Field(() => String)
  user_id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  address: string;

  @Field(() => String)
  create_time: string;

  @Field(() => [Currency], { nullable: 'itemsAndList' })
  balances: Currency[];
}

@ObjectType()
export class CountWallets {
  @Field(() => Int)
  total: number;
}

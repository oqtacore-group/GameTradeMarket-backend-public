import { Field, ObjectType, ID, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class GameCurrency {
  @Field(() => ID, { nullable: true })
  id: number;

  @Field(() => String)
  coin_name: string;

  @Field(() => String, { nullable: true })
  logo: string;

  @Field(() => String, { nullable: true })
  blockchain_code: string;

  @Field(() => Int, { nullable: true })
  decimals: number;

  @Field(() => String, { nullable: true })
  contract_address: string;

  @Field(() => Float, { nullable: true })
  price: number;

  @Field(() => String, { nullable: true })
  crypto_currency: string;

  @Field(() => Float, { nullable: true })
  crypto_price: number;
}

import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CoinInfoDto {
  @Field(() => String)
  coin_address: string;
  @Field(() => String)
  blockchain: string;
  @Field(() => Float, { defaultValue: 0, nullable: true })
  usd_price: number;
  @Field(() => Float, { defaultValue: 0, nullable: true })
  usd_price_per_coin: number;
  @Field(() => Float, { defaultValue: 0 })
  price: number;
  @Field(() => Int)
  decimals: number;
  @Field(() => String)
  symbol: string;
  @Field(() => String)
  logo: string;
}

import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SalesDto {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  seller_email: string;

  @Field(() => String)
  seller_nick_name: string;

  @Field(() => String)
  seller_wallet: string;

  @Field(() => String)
  buyer_mail: string;

  @Field(() => String)
  buyer_nick_name: string;

  @Field(() => String)
  buyer_wallet: string;

  @Field(() => String)
  created_on: string;

  @Field(() => String)
  contract_id: string;

  @Field(() => String)
  token_id: string;

  @Field(() => String)
  url: string;

  @Field(() => Float)
  value: number;

  @Field(() => String)
  currency: string;

  @Field(() => String)
  blockchain: string;
}

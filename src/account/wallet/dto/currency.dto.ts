import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Currency {
  @Field(() => String)
  contract: string;
  @Field(() => String)
  name: string;
  @Field(() => Int, { defaultValue: 18 })
  decimals?: number;
  @Field(() => String)
  currency: string;
  @Field(() => String)
  value: string;
  @Field(() => String)
  blockchain: string;
}

@ObjectType({ implements: [Error] })
export class CurrencyError implements Error {
  @Field(() => String)
  message: string;
  @Field(() => String)
  name: string;
  @Field(() => String)
  code: string;
  @Field(() => String)
  currency: string;
}

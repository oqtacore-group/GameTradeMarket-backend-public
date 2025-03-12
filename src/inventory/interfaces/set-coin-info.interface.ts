import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SetCoinInfo {
  @Field(() => String)
  coin_address: string;
  @Field(() => Float)
  coin_price: number;
}

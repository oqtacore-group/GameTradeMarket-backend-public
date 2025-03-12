import { Field, Float, InputType } from '@nestjs/graphql';
import { IsEthereumAddress, IsNumber, IsOptional } from 'class-validator';

@InputType()
export class SetCoinInfoInput {
  @Field(() => String)
  readonly tokenValue: string;
  @IsEthereumAddress()
  @Field(() => String)
  readonly contract: string;
  @IsOptional()
  @IsEthereumAddress()
  @Field(() => String, { nullable: true })
  readonly coin_address?: string;
  @IsNumber()
  @IsOptional()
  @Field(() => Float, { nullable: true })
  readonly coin_price?: number;
}

import { Field, InputType, Float, ObjectType } from '@nestjs/graphql';
import { Blockchain } from '../interfaces/blockchain.interface';
import {
  CardProp,
  GameCardTxData,
  HistoryPrice,
} from '../../inventory/interfaces/card.interface';

@ObjectType('TokenDataAttrsDto')
@InputType('TokenDataAttrsInput')
export class TokenDataAttrs {
  @Field(() => String)
  name: string;
  @Field(() => String)
  picture: string;
  @Field(() => String, { nullable: true })
  external_url: string;
  @Field(() => String, { nullable: true })
  token_url: string;
  @Field(() => String, { nullable: true })
  description: string;
  @Field(() => [CardProp])
  attributes: any[];
  @Field(() => [GameCardTxData])
  token_tx_data: any[];
  @Field(() => String, { nullable: true })
  animation_url: string;
  @Field(() => HistoryPrice, { nullable: true })
  history_price: any;
}

@ObjectType()
export class TokenInfo {
  @Field(() => String)
  token_value: string;
  @Field(() => String)
  contract: string;
  @Field(() => String)
  blockchain: Blockchain;
  @Field(() => String, { nullable: true })
  token_uri: string;
  @Field(() => String, { nullable: true })
  owner: string;
  @Field(() => String)
  trade_contract: string;
  @Field(() => String, { nullable: true })
  game_code: string;
  @Field(() => TokenDataAttrs, { nullable: true })
  attributes: TokenDataAttrs;
  @Field(() => String, { nullable: true })
  picture: string;
  @Field(() => String)
  name: string;
  @Field(() => Float)
  price: number;
  @Field(() => Float)
  fee: number;
  @Field(() => Boolean)
  approved: boolean;

  isGameTrade: boolean;
  @Field(() => String)
  item_data?: any;
}

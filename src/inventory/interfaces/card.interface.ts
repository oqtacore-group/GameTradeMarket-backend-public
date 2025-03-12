import {
  Field,
  Float,
  ID,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import {
  PageInfo,
  PaginationParams,
  SortValues,
} from '../../utils/interfaces/utils.interface';
import { GameTokenFacetTypeEnum } from './market.interface';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Blockchain } from '../../blockchain/interfaces/blockchain.interface';
import { SaleType } from '../models/inventory.entity';
import { ApiProperty } from '@nestjs/swagger';
import { CoinInfoDto } from './coin-info.dto';
import { Type } from 'class-transformer';


export enum Currency {
  ETH = 'ETH',
  MATIC = 'MATIC',
  USD = 'USD',
  BNB = 'BNB'
}

registerEnumType(Currency, { name: 'CurrencyValues' });

export enum DisplayType {
  string = 'string',
  number = 'number',
  boost_percentage = 'boost_percentage',
  boost_number = 'boost_number',
  date = 'date',
}

registerEnumType(DisplayType, { name: 'DisplayType' });

@InputType()
export class GameCardsFacetsParamValue {
  @Field(() => String, { nullable: true })
  readonly key: string;
  @Field(() => Int, { nullable: true })
  readonly count: number;
}

@InputType()
export class GameCardSort {
  @Field(() => SortValues, { nullable: true })
  readonly price: SortValues;

  @Field(() => SortValues, { nullable: true })
  readonly rating: SortValues;
}

@InputType()
export class GameCardsFacetsParam {
  @Field(() => String)
  readonly key: string;
  @Field(() => GameTokenFacetTypeEnum)
  readonly type: GameTokenFacetTypeEnum;
  @Field(() => [GameCardsFacetsParamValue], { nullable: 'itemsAndList' })
  readonly values?: GameCardsFacetsParamValue[];
  @Field(() => Int, { nullable: true })
  readonly min?: number;
  @Field(() => Int, { nullable: true })
  readonly max?: number;
}

@InputType()
export class GameCardPriceFilter {
  @Field(() => Float, { nullable: true })
  readonly min?: number;
  @Field(() => Float, { nullable: true })
  readonly max?: number;
}

@InputType()
export class GameCardsParams extends PaginationParams {
  @Field(() => String, { nullable: true })
  readonly id?: string;

  @IsOptional()
  @IsArray()
  @Type(() => String)
  @ValidateNested({ each: true })
  @Field(() => [String], { nullable: 'itemsAndList' })
  readonly blockchains?: string[];

  @Field(() => [String], { nullable: 'itemsAndList' })
  readonly coinAddress?: string[];

  @Field(() => [String], { nullable: 'itemsAndList' })
  readonly blockchain?: string[];

  @Field(() => String, { nullable: true })
  readonly gameCode?: string;

  @Field(() => String, { nullable: true })
  readonly contract?: string;

  @Field(() => String, { nullable: true })
  readonly tokenValue?: string;

  @Field(() => String, { nullable: true })
  readonly name?: string;

  @IsOptional()
  @IsEnum(SaleType, { each: true })
  @Field(() => [SaleType], { nullable: 'itemsAndList' })
  readonly saleTypes?: SaleType[];

  @Field(() => GameCardPriceFilter, { nullable: true })
  readonly price?: GameCardPriceFilter;

  @Field(() => [GameCardsFacetsParam], { nullable: 'itemsAndList' })
  readonly facets?: GameCardsFacetsParam[];

  @Field(() => GameCardSort, { nullable: true })
  readonly sort?: GameCardSort;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  readonly platform?: string;
}

@InputType()
export class GameTokenCardParams {
  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  readonly id?: string;
  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  readonly contract?: string;
  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  readonly blockchain?: Blockchain;
  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  readonly tokenValue?: string;
  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  readonly gameCode?: string;
}

@InputType()
export class SimilarCardsParams extends PaginationParams {
  @Field(() => String)
  readonly id: string;
}

@ObjectType('HistoryPriceDto')
@InputType('HistoryPriceInput')
export class HistoryPrice {
  @Field(() => [String])
  price: string[];
}

@ObjectType('ItemDataDto')
@InputType('ItemDataInput')
export class ItemData {
  @Field(() => [PricesData], { nullable: true })
  prices?: PricesData[];
  @Field(() => String, { nullable: true })
  item_id?: string;
}

@ObjectType('PricesDataDto')
@InputType('PricesDataInput')
export class PricesData {
  @Field(() => String, { nullable: true })
  signature?: string;
  @Field(() => String, { nullable: true })
  type?: string;
  @Field(() => String, { nullable: true })
  source?: string;
  @Field(() => String, { nullable: true })
  tokenMint?: string;
  @Field(() => String, { nullable: true })
  collectionSymbol?: string;
  @Field(() => String, { nullable: true })
  slot?: string;
  @Field(() => String, { nullable: true })
  blockTime?: string;
  @Field(() => String, { nullable: true })
  buyer?: string;
  @Field(() => String, { nullable: true })
  buyerReferral?: string;
  @Field(() => String, { nullable: true })
  seller?: string;
  @Field(() => String, { nullable: true })
  sellerReferral?: string;
  @Field(() => String, { nullable: true })
  price?: string;
}

@ObjectType()
export class Card {
  @Field(() => ID)
  @ApiProperty({ description: 'Id', required: true })
  id: number;
  @Field(() => String)
  @ApiProperty({ description: 'Contract', required: true })
  contract: string;
  @Field(() => String)
  @ApiProperty({ description: 'Owner', required: true })
  owner: string;
  @Field(() => String)
  @ApiProperty({ description: 'Game code', required: true })
  game_code: string;
  @Field(() => String, { nullable: true })
  @ApiProperty({ description: 'Game name', required: true })
  game_name: string;
  @Field(() => String, { nullable: true })
  @ApiProperty({ description: 'Trade contract opensea', required: true })
  trade_contract_opensea: string;
  @Field(() => String, { nullable: true })
  @ApiProperty({ description: 'Trade contract GTM', required: true })
  trade_contract_gametrade: string;
  @Field(() => String)
  @ApiProperty({ description: 'Token value', required: true })
  token_value: string;
  @Field(() => String, { nullable: true })
  @ApiProperty({ description: 'Name', required: true })
  name?: string;
  @Field(() => String, { nullable: true })
  @ApiProperty({ description: 'Description', required: true })
  description?: string;
  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Price', required: false })
  price?: number;
  @Field(() => String, { nullable: true })
  picture?: string;
  @Field(() => String)
  @ApiProperty({ description: 'Blockchain', required: true })
  blockchain: string;
  @Field(() => String, { nullable: true })
  @ApiProperty({ description: 'Token URI', required: true })
  token_uri?: string;
  @Field(() => String, { nullable: true })
  @ApiProperty({ description: 'External URL', required: true })
  external_url?: string;
  @Field(() => String, { nullable: true })
  @ApiProperty({ description: 'Token URL', required: true })
  token_url?: string;
  @Field(() => Boolean, { defaultValue: false })
  is_external_item?: boolean;
  @Field(() => [GameCardTxData], { nullable: true })
  token_tx_data?: GameCardTxData[];
  @Field(() => HistoryPrice, { nullable: true })
  history_price?: HistoryPrice;
  @Field(() => String, { nullable: true })
  animation_url?: string;
  @Field(() => String)
  platform: string;
  @Field(() => [CardProp], { nullable: true })
  props?: CardProp[];
  @Field(() => [CardLevel], { nullable: true })
  levels?: CardLevel[];
  @Field(() => Boolean, { nullable: true })
  approved?: boolean;
  @Field(() => Int, { nullable: true })
  imxOrderId?: number;
  @Field(() => CoinInfoDto, { nullable: true })
  coin_info?: CoinInfoDto;
  @Field(() => ItemData, { nullable: true })
  item_data?: ItemData;
}

@ObjectType('GameCardTxDataDto')
@InputType('GameCardTxDataInput')
export class GameCardTxData {
  @Field(() => String)
  readonly gas: string;
  @Field(() => String)
  readonly value: string;
  @Field(() => String)
  readonly from: string;
  @Field(() => String)
  readonly to: string;
  @Field(() => String)
  readonly data: string;
}

@ObjectType()
export class CardEdges {
  @Field(() => [Card], { nullable: true })
  @ApiProperty({ description: 'Card', type: [Card], required: true })
  node?: Card[];
}

@ObjectType()
export class CardConnection {
  @Field(() => Int)
  @ApiProperty({ description: 'Total count', required: true })
  totalCount: number;

  @Field(() => CardEdges)
  @ApiProperty({ description: 'Edges', type: CardEdges, required: true })
  edges: CardEdges;

  @Field(() => PageInfo)
  @ApiProperty({ description: 'Page Info', required: true })
  pageInfo: PageInfo;
}

@ObjectType('CardPropDto')
@InputType('CardPropInput')
export class CardProp {
  @Field(() => String, { nullable: true })
  trait_type: string;
  @Field(() => String, { nullable: true })
  value: string;
  @Field(() => DisplayType, {
    nullable: true,
    defaultValue: DisplayType.string,
  })
  display_type: DisplayType;
  @Field(() => Int, { nullable: true })
  trait_count: number;
  @Field(() => String, { nullable: true })
  max_value: string;
  @Field(() => String, { nullable: true })
  order: string;
  @Field(() => Int, { defaultValue: 0 })
  max_count: number;
}

@ObjectType()
export class CardLevel {
  @Field(() => String, { nullable: true })
  trait_type: string;
  @Field(() => Float, { nullable: true })
  value: number;
  @Field(() => DisplayType, {
    nullable: true,
    defaultValue: DisplayType.string,
  })
  display_type: DisplayType;
  @Field(() => Int, { nullable: true })
  trait_count: number;
  @Field(() => Float, { nullable: true })
  max_value: number;
  @Field(() => String, { nullable: true })
  order: string;
  @Field(() => Int, { defaultValue: 0 })
  max_count: number;
}

@ObjectType()
export class CardItem {
  @Field(() => ID)
  id: number;
  @Field(() => String)
  contract: string;
  @Field(() => String)
  owner: string;
  token_value: string;
  @Field(() => Float, { nullable: true })
  price?: number;
  @Field(() => String)
  blockchain: string;
  @Field(() => String)
  platform: string;
}

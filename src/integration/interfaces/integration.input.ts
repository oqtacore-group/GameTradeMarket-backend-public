import { Field, Float, InputType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsEmail,
  IsEthereumAddress,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import {
  CardProp,
  Currency,
  GameCardTxData,
  HistoryPrice,
  ItemData,
} from '../../inventory/interfaces/card.interface';
import { PaginationParams } from '../../utils/interfaces/utils.interface';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class ImportTokenInput {
  @IsString()
  @Field(() => String)
  @ApiProperty({ description: 'Token value', required: true })
  readonly token_value: string;
  @IsOptional()
  @IsString()
  @Field(() => Currency, { nullable: true })
  @ApiProperty({
    description: 'Currency',
    required: false,
    examples: Object.values(Currency),
  })
  readonly currency?: Currency;
  @Field(() => String)
  @ApiProperty({ description: 'Address smart contract', required: true })
  readonly contract: string;
  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  readonly name?: string;
  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  readonly description?: string;
  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  readonly owner?: string;
  @IsOptional()
  @IsUrl()
  @Field(() => String, { nullable: true })
  readonly token_uri?: string;
  @IsOptional()
  @IsUrl()
  @Field(() => String, { nullable: true })
  readonly image_uri?: string;
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CardProp)
  @Field(() => [CardProp], { nullable: true })
  readonly attributes?: CardProp[];
  @IsOptional()
  @IsUrl()
  @Field(() => String, { nullable: true })
  readonly external_url?: string;
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => GameCardTxData)
  @Field(() => [GameCardTxData], { nullable: true })
  readonly token_tx_data?: GameCardTxData[];
  @IsOptional()
  @Type(() => HistoryPrice)
  @Field(() => HistoryPrice, { nullable: true })
  readonly history_price?: HistoryPrice;
  @IsOptional()
  @IsUrl()
  @Field(() => String, { nullable: true })
  readonly token_url?: string;
  @IsNumber()
  @Field(() => Float, { defaultValue: 0 })
  @ApiProperty({ description: 'Token price', required: true })
  readonly price: number;
  @IsOptional()
  @IsNumber()
  @Field(() => Float, { defaultValue: 0 })
  readonly fee?: number;
  @IsBoolean()
  @Field(() => Boolean, { defaultValue: false })
  readonly approved = false;
  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  readonly platform?: string;
  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  readonly animation_url?: string;
  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  readonly coin_address?: string;
  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: false })
  readonly game_code?: string;
  @Field(() => String, { nullable: false })
  readonly blockchain?: string;
  @IsOptional()
  @Type(() => ItemData)
  @Field(() => ItemData, { nullable: true })
  readonly item_data?: ItemData;
}

@InputType()
export class UpdatePriceInput {
  @Field(() => String)
  readonly token_value: string;
  @Field(() => String)
  readonly contract: string;
  @Field(() => Currency)
  readonly currency: Currency;
  @Field(() => Float, { defaultValue: 0 })
  readonly price: number;
  @Field(() => Float, { defaultValue: 0 })
  readonly fee: number;
}

@InputType()
export class BuyInput {
  @Field(() => String)
  readonly token_value: string;
  @Field(() => String)
  readonly contract: string;
  @Field(() => String)
  readonly owner: string;
}

@InputType()
export class GetGameItemsInput extends PaginationParams {
  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  readonly id?: string;
  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  @ApiProperty({ description: 'Game identity', required: false })
  readonly game_code?: string;
  @IsOptional()
  @IsEthereumAddress()
  @Field(() => String, { nullable: true })
  @ApiProperty({ description: 'Game contract', required: false })
  readonly contract?: string;
}

@InputType()
export class DeleteGameItemInput {
  @IsString()
  @Field(() => String)
  @ApiProperty({ description: 'Token identity', required: true })
  readonly token_value: string;
  @IsEthereumAddress()
  @Field(() => String)
  @ApiProperty({ description: 'Game contract', required: true })
  readonly contract: string;
}

@InputType()
export class ImportContractInput {
  @IsString()
  @Field(() => String)
  readonly game_code: string;
  @IsEthereumAddress()
  @Field(() => String)
  readonly contract: string;
  @IsString()
  @Field(() => String)
  readonly blockchain: string;
  @IsString()
  @Field(() => String)
  readonly platform: string;
}

@InputType()
export class PingActiveGameInput {
  @IsNumber()
  @ApiProperty({ description: 'Game duration in ms', required: true })
  readonly duration: number;

  @IsString()
  @ApiProperty({ description: 'Game identity', required: true })
  readonly game_code: string;
}

@InputType()
export class CreateUserInput {
  @IsEmail()
  @Field(() => String)
  email: string;
  @Field(() => String)
  readonly custom_url: string;
  @IsString()
  @Field(() => String)
  readonly nick_name: string;
  @IsString()
  @Field(() => String)
  readonly image_url: string;
  @Field(() => String)
  readonly last_visited: string;
}

@InputType()
export class GetGameCardMint {
  @Field(() => String)
  readonly code: string;
}

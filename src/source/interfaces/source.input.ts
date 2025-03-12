import { PaginationParams } from '../../utils/interfaces/utils.interface';
import { Field, Float, InputType } from '@nestjs/graphql';
import { AppLink, MediaLink, SocialLink } from '../dto/source.dto';
import {
  SourceStateType,
  SourceStateTypeEnum,
} from '../types/source-state.type';
import { GameCardSort } from '../../inventory/interfaces/card.interface';
import { ContractCreateInput } from '../dto/contract-create.input';
import { Blockchain } from '../../blockchain/interfaces/blockchain.interface';

@InputType()
export class GamesParams extends PaginationParams {
  @Field(() => String, { nullable: true })
  readonly name: string;
  @Field(() => String, { nullable: true })
  readonly gameCode: string;
  @Field(() => String, { nullable: true })
  readonly contract: string;
  @Field(() => String, { nullable: true })
  readonly blockchain: Blockchain;
}

@InputType()
export class FacetMinMax {
  @Field(() => String)
  code: string;
  @Field(() => Float, { nullable: true })
  min: number;
  @Field(() => Float, { nullable: true })
  max: number;
}

@InputType()
export class PriceModelInput {
  @Field(() => Boolean, { defaultValue: false })
  readonly isFreeToPlay: boolean;
  @Field(() => Boolean, { defaultValue: false })
  readonly isNftRequired: boolean;
  @Field(() => Boolean, { defaultValue: false })
  readonly isCryptoRequired: boolean;
  @Field(() => Boolean, { defaultValue: false })
  readonly isGameRequired: boolean;
}

@InputType()
export class CatalogGameParams extends PaginationParams {
  @Field(() => String, { nullable: true })
  readonly name?: string;
  @Field(() => String, { nullable: true })
  readonly gameCode?: string;
  @Field(() => [String], { nullable: 'itemsAndList' })
  readonly priceModels?: string[];
  @Field(() => [String], { nullable: 'itemsAndList' })
  readonly playAndEarn?: string[];
  @Field(() => [String], { nullable: 'itemsAndList' })
  readonly releaseDates?: string[];
  @Field(() => [String], { nullable: 'itemsAndList' })
  readonly blockchains?: string[];
  @Field(() => [String], { nullable: 'itemsAndList' })
  readonly genreCodes?: string[];
  @Field(() => String, { nullable: true })
  readonly gameStatus?: string;
  @Field(() => String, { nullable: true })
  readonly device?: string;
  @Field(() => [FacetMinMax], { nullable: 'itemsAndList' })
  readonly prices?: FacetMinMax[];
  @Field(() => Boolean, { nullable: true })
  readonly friendInGames?: boolean;
  @Field(() => Boolean, { nullable: true })
  readonly topFree?: boolean;
  @Field(() => Boolean, { nullable: true })
  readonly topRank?: boolean;
  @Field(() => Boolean, { nullable: true })
  readonly isTrending?: boolean;
  @Field(() => Boolean, { nullable: true })
  readonly topReview?: boolean;
  @Field(() => GameCardSort, { nullable: true })
  readonly sort?: GameCardSort;
}

@InputType()
export class GameCardParams {
  @Field(() => String, { nullable: true })
  readonly code: string;
}

@InputType({ description: 'Add game' })
export class AddSourceInput {
  @Field(() => String, { description: 'Game name' })
  readonly name: string;
  @Field(() => String, { description: 'Logo URL' })
  readonly logo_url: string;
  @Field(() => String, { description: 'Game website URL' })
  readonly external_url: string;
  @Field(() => String, { description: 'Banner URL' })
  readonly picture_url: string;
  @Field(() => SourceStateTypeEnum, { description: 'Game type' })
  readonly state: SourceStateType;
  @Field(() => String, { description: 'Game description' })
  readonly description: string;
  @Field(() => String, { description: 'Publisher name' })
  readonly publisher: string;
  @Field(() => String, { description: 'Developer' })
  readonly developer: string;
  @Field(() => String)
  readonly release_date: string;
  @Field(() => Boolean, { defaultValue: false })
  readonly is_free_to_play: boolean;
  @Field(() => Boolean, { defaultValue: false })
  readonly is_nft_required: boolean;
  @Field(() => Boolean, { defaultValue: false })
  readonly is_crypto_required: boolean;
  @Field(() => Boolean, { defaultValue: false })
  readonly is_game_required: boolean;
  @Field(() => Boolean, { defaultValue: false })
  readonly is_play_to_earn_nft: boolean;
  @Field(() => Boolean, { defaultValue: false })
  readonly is_play_to_earn_crypto: boolean;
  @Field(() => Boolean, { defaultValue: false, nullable: true })
  readonly is_partner: boolean;
  @Field(() => [MediaLink], { description: 'Media links', nullable: 'items' })
  readonly media_links: MediaLink[];
  @Field(() => [SocialLink], {
    description: 'Social media links',
    nullable: 'items',
  })
  readonly social_links: SocialLink[];
  @Field(() => [AppLink], {
    description: 'App links',
    nullable: 'items',
  })
  readonly app_links: AppLink[];
  @Field(() => String, { description: 'Game genre' })
  readonly genre_code: string;
  @Field(() => [ContractCreateInput], {
    description: 'Related smart contracts',
    nullable: 'itemsAndList',
  })
  readonly contracts: ContractCreateInput[];
}

@InputType({ description: 'Update game' })
export class UpdateSourceInput {
  @Field(() => String, { description: 'Game ID' })
  readonly code: string;
  @Field(() => Boolean, { description: 'Game mode', nullable: true })
  readonly is_free_to_play: boolean;
  @Field(() => Boolean, { nullable: true })
  readonly is_nft_required: boolean;
  @Field(() => Boolean, { nullable: true })
  readonly is_crypto_required: boolean;
  @Field(() => Boolean, { nullable: true })
  readonly is_game_required: boolean;
  @Field(() => Boolean, { nullable: true })
  readonly is_play_to_earn_nft: boolean;
  @Field(() => Boolean, { nullable: true })
  readonly is_play_to_earn_crypto: boolean;
  @Field(() => Boolean, { defaultValue: false, nullable: true })
  readonly is_partner: boolean;
  @Field(() => String, { description: 'Banner URL', nullable: true })
  readonly picture_url: string;
  @Field(() => String, { description: 'Game name', nullable: true })
  readonly name: string;
  @Field(() => SourceStateTypeEnum, {
    description: 'Game type',
    nullable: true,
  })
  readonly state: SourceStateType;
  @Field(() => String, { description: 'Logo URL', nullable: true })
  readonly logo_url: string;
  @Field(() => String, { description: 'Game website URL', nullable: true })
  readonly external_url: string;
  @Field(() => String, { description: 'Game description', nullable: true })
  readonly description: string;
  @Field(() => String, { description: 'Publisher name', nullable: true })
  readonly publisher: string;
  @Field(() => String, { description: 'Developer', nullable: true })
  readonly developer: string;
  @Field(() => [MediaLink], {
    description: 'Media links',
    nullable: 'itemsAndList',
  })
  readonly media_links: MediaLink[];
  @Field(() => [SocialLink], {
    description: 'Social media links',
    nullable: 'itemsAndList',
  })
  readonly social_links: SocialLink[];
  @Field(() => [AppLink], {
    description: 'App links',
    nullable: 'itemsAndList',
  })
  readonly app_links: AppLink[];
  @Field(() => String, { description: 'Game genre', nullable: true })
  readonly genre_code: string;
  @Field(() => String, { nullable: true })
  readonly release_date: string;
  @Field(() => [ContractCreateInput], {
    description: 'Related smart contracts',
    nullable: 'itemsAndList',
  })
  readonly contracts: ContractCreateInput[];
}

@InputType({ description: 'Delete game' })
export class RemoveSourceInput {
  @Field(() => String, { description: 'Game ID' })
  readonly code: string;
}

@InputType({ description: 'List of smart contracts for game' })
export class ContractsListParams {
  @Field(() => String, { description: 'Game ID' })
  readonly code: string;
}

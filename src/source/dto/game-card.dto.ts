import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GameCurrency } from './source-currency.dto';
import { AppLink, MediaLink, SocialLink } from './source.dto';

@ObjectType()
export class GameCard {
  @Field(() => ID, { nullable: true })
  code: string;

  @Field(() => String, { nullable: true })
  name: string;

  @Field(() => String, { nullable: true })
  publisher: string;

  @Field(() => String, { nullable: true })
  developer: string;

  @Field(() => String, { nullable: true })
  description: string;

  @Field(() => String, { nullable: true })
  release_date: string;

  @Field(() => [AppLink], { nullable: 'items' })
  app_links: AppLink[];

  @Field(() => [SocialLink], { nullable: 'items' })
  social_links: SocialLink[];

  @Field(() => [MediaLink], { nullable: 'items' })
  media_links: MediaLink[];

  @Field(() => MediaLink, { nullable: true })
  first_media_link?: MediaLink;

  @Field(() => [GameCurrency], { nullable: 'items' })
  currencies: GameCurrency[];

  @Field(() => String, { nullable: true })
  logo: string;

  @Field(() => String, { nullable: true })
  external_url: string;

  @Field(() => String, { nullable: true })
  picture_url?: string;

  @Field(() => Boolean, { defaultValue: false, nullable: true })
  is_partner?: boolean;

  @Field(() => Boolean, { defaultValue: false })
  is_free_to_play: boolean;

  @Field(() => Boolean, { defaultValue: false })
  is_nft_required: boolean;

  @Field(() => Boolean, { defaultValue: false })
  is_crypto_required: boolean;

  @Field(() => Boolean, { defaultValue: false })
  is_game_required: boolean;

  @Field(() => Boolean, { defaultValue: false })
  is_play_to_earn_nft: boolean;

  @Field(() => Boolean, { defaultValue: false })
  is_play_to_earn_crypto: boolean;

  @Field(() => Boolean, { nullable: true })
  admitted_to_trading: boolean;
}

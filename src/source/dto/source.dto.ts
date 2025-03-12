import {
  Field,
  Float,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { PageInfo } from '../../utils/interfaces/utils.interface';
import { SocialKind } from '../../account/models/account.entity';
import { FilterType } from '../../inventory/interfaces/market.interface';

export enum AppLinkKind {
  IOS = 'IOS',
  ANDROID = 'ANDROID',
  LINUX = 'LINUX',
  WINDOWS = 'WINDOWS',
  MAC = 'MAC',
  WEB = 'WEB',
}

registerEnumType(AppLinkKind, { name: 'AppLinkKind' });

@ObjectType()
export class Genre {
  @Field(() => String)
  code: string;
  @Field(() => String)
  name: string;
}

@InputType('SocialLinkInput')
@ObjectType()
export class SocialLink {
  @Field(() => SocialKind)
  type: SocialKind;
  @Field(() => String)
  link: string;
}

@InputType('AppLinkInput')
@ObjectType()
export class AppLink {
  @Field(() => AppLinkKind)
  type: AppLinkKind;
  @Field(() => String)
  link: string;
}

@InputType('MediaLinkInput')
@ObjectType()
export class MediaLink {
  @Field(() => String)
  type: string;
  @Field(() => String)
  link: string;
}

@ObjectType()
export class Game {
  @Field(() => String)
  code: string;
  @Field(() => String)
  name: string;
}

@ObjectType()
export class GameCardContract {
  @Field(() => String)
  title: string;
  @Field(() => String)
  contract_address: string;
  @Field(() => Boolean, { defaultValue: false })
  verify = false;
  @Field(() => String, { nullable: true })
  link: string;
  @Field(() => String)
  blockchain: string;
}

@ObjectType()
export class GameEdges {
  @Field(() => [Game], { nullable: true })
  node?: Game[];
}

@ObjectType()
export class GameConnection {
  @Field(() => Int)
  totalCount: number;
  @Field(() => GameEdges)
  edges: GameEdges;
  @Field(() => PageInfo)
  pageInfo: PageInfo;
}

@ObjectType()
export class CountGames {
  @Field(() => Int, { defaultValue: 0 })
  total: number;
}

@ObjectType()
export class GameFilterValue {
  @Field(() => String)
  code: string;
  @Field(() => String)
  title: string;
  @Field(() => Boolean)
  checked: boolean;
  @Field(() => Boolean)
  disable: boolean;
}

@ObjectType()
export class GameFilter {
  @Field(() => String)
  key: string;
  @Field(() => String)
  title: string;
  @Field(() => FilterType, { nullable: true })
  type?: FilterType;
  @Field(() => [GameFilterValue], { nullable: true })
  items?: GameFilterValue[];
}

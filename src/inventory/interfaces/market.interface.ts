import {
  Field,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

export enum FilterType {
  CHECKBOX = 'CHECKBOX',
  COINCHECKBOX = 'CHECKBOX',
  MIN_MAX = 'MIN_MAX',
  RADIO = 'RADIO',
}

export enum GameTokenFacetTypeEnum {
  LEVEL = 'LEVEL',
  PROP = 'PROP',
}

registerEnumType(FilterType, { name: 'FilterType' });
registerEnumType(GameTokenFacetTypeEnum, { name: 'GameTokenFacetTypeEnum' });

@InputType()
export class GameTokenFacetsParams {
  @Field(() => String)
  gameCode: string;
}

@ObjectType()
export class GameCoinFilterValue {
  @Field(() => String, {nullable: true})
  code: string;
  @Field(() => String, {nullable: true})
  title: string;
  @Field(() => String, {nullable: true})
  coin_address: string;
  @Field(() => String, {nullable: true})
  blockchain: string;
  @Field(() => Boolean, {nullable: true})
  checked: boolean;
  @Field(() => Boolean, {nullable: true})
  disable: boolean;
}
@ObjectType()
export class GameTokenFilterValue {
  @Field(() => String)
  code: string;
  @Field(() => String)
  title: string;
  @Field(() => Boolean)
  checked: boolean;
  @Field(() => Boolean)
  disable: boolean;
  @Field(() => [GameCoinFilterValue], {nullable: true})
  coins?: GameCoinFilterValue[];
}

@ObjectType()
export class GameTokenFilter {
  @Field(() => String)
  key: string;
  @Field(() => String)
  title: string;
  @Field(() => FilterType, { nullable: true })
  type?: FilterType;
  @Field(() => [GameTokenFilterValue], { nullable: true })
  items?: GameTokenFilterValue[];
}

@ObjectType()
export class GameTokenFacetValue {
  @Field(() => String)
  key: string;
  @Field(() => Int)
  count: number;
}

@ObjectType()
export class GameTokenFacet {
  @Field(() => String, { nullable: true })
  key?: string;
  @Field(() => GameTokenFacetTypeEnum, { nullable: true })
  type?: GameTokenFacetTypeEnum;
  @Field(() => [GameTokenFacetValue], { nullable: true })
  values?: any;
  @Field(() => String, { nullable: true })
  min?: string;
  @Field(() => String, { nullable: true })
  max?: string;
}

import { Field, InputType } from '@nestjs/graphql';
import { GameCardPriceFilter } from './card.interface';
import { PaginationParams } from '../../utils/interfaces/utils.interface';

@InputType()
export class GetInventoryParams extends PaginationParams {
  @Field(() => String, { nullable: true })
  userId: string;
  @Field(() => String, { nullable: true })
  customUrl: string;
  @Field(() => String, { nullable: true })
  name: string;
  @Field(() => String, { nullable: true })
  gameCode: string;
  @Field(() => Boolean, { nullable: true })
  hasPrice: boolean;
  @Field(() => GameCardPriceFilter, { nullable: true })
  price: GameCardPriceFilter;
  @Field(() => GameCardPriceFilter, { nullable: true })
  sort: GameCardPriceFilter;
}

@InputType()
export class GameTokenFilterParams {
  @Field(() => String, { nullable: true })
  gameCode: string;
}

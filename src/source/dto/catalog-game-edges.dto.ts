import { Field, ObjectType } from '@nestjs/graphql';
import { GameCard } from './game-card.dto';
@ObjectType()
export class CatalogGameEdges {
  @Field(() => [GameCard], { nullable: true })
  node?: GameCard[];
}

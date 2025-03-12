import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PageInfo } from '../../utils/interfaces/utils.interface';
import { CatalogGameEdges } from './catalog-game-edges.dto';

@ObjectType()
export class CatalogGameConnection {
  @Field(() => Int)
  totalCount: number;
  @Field(() => CatalogGameEdges)
  edges: CatalogGameEdges;
  @Field(() => PageInfo)
  pageInfo: PageInfo;
}

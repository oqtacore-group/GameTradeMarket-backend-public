import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PageInfo } from '../../utils/interfaces/utils.interface';
import { LogEdges } from './log-edges.dto';

@ObjectType()
export class Logs {
  @Field(() => Int)
  totalCount: number;

  @Field(() => LogEdges)
  edges: LogEdges;

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}

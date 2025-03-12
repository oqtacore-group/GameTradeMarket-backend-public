import { PageInfo } from '../../utils/interfaces/utils.interface';
import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { AccountEntity } from '../../account/models/account.entity';

@ObjectType()
export class Activity {
  @Field(() => ID)
  id: number;

  @Field(() => Float)
  price: number;

  @Field(() => AccountEntity)
  seller: AccountEntity;

  @Field(() => AccountEntity)
  buyer: AccountEntity;

  @Field(() => String)
  game_name: string;

  @Field(() => String)
  token_name: string;

  @Field(() => String)
  token_id: string;

  @Field(() => String)
  type_event: string;

  @Field(() => String)
  blockchain: string;

  @Field(() => String)
  currency: string;

  @Field(() => Date)
  created_at: Date;
}

@ObjectType()
export class ActivityEdges {
  @Field(() => [Activity], { nullable: 'items' })
  node: Activity[];
}

@ObjectType()
export class ActivitiesDto {
  @Field(() => Int)
  totalCount: number;

  @Field(() => ActivityEdges)
  edges: ActivityEdges;

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}

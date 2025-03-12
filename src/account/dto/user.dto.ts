import { Field, Int, ObjectType } from '@nestjs/graphql';
import { AccountEntity } from '../models/account.entity';
import { PageInfo } from '../../utils/interfaces/utils.interface';

@ObjectType()
export class UserEdges {
  @Field(() => [AccountEntity], { nullable: true })
  node: AccountEntity[];
}

@ObjectType()
export class UserConnection {
  @Field(() => Int)
  totalCount: number;
  @Field(() => UserEdges)
  edges: UserEdges;
  @Field(() => PageInfo)
  pageInfo: PageInfo;
}

@ObjectType()
export class IsMyFriend {
  @Field(() => Boolean)
  isMyFriend: boolean;
}

@ObjectType()
export class IsFriendRequestSent {
  @Field(() => Boolean)
  isFriendRequestSent: boolean;
}

@ObjectType()
export class CountUsers {
  @Field(() => Int)
  total: number;
}

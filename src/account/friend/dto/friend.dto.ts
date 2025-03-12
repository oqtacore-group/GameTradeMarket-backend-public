import { Field, ObjectType } from '@nestjs/graphql';

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
export class IsFriendRequestSentToMe {
  @Field(() => Boolean)
  isFriendRequestSentToMe: boolean;

  @Field(() => String)
  friend: string;
}

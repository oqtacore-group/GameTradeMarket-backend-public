import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FriendService } from './friend.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard, CurrentUser } from '../../auth/auth.guard';
import { IUser } from '../../auth/interfaces/user.interface';
import { Success } from '../../utils/interfaces/response.interface';
import { FriendEntity } from './models/friend.entity';
import { UserConnection } from '../dto/user.dto';
import {
  IsMyFriend,
  IsFriendRequestSent,
  IsFriendRequestSentToMe,
} from './dto/friend.dto';

@UseGuards(AuthGuard)
@Resolver(() => FriendEntity)
export class FriendResolver {
  constructor(private readonly friendService: FriendService) {}

  @Query(() => UserConnection)
  async incomingRequests(@CurrentUser() owner: IUser) {
    return await this.friendService.getMyIncomingRequests(owner.sub);
  }

  @Query(() => UserConnection)
  async outgoingRequests(@CurrentUser() owner: IUser) {
    return await this.friendService.getMyOutgoingRequests(owner.sub);
  }

  @Query(() => IsFriendRequestSent)
  async isFriendRequestSent(
    @CurrentUser() owner: IUser,
    @Args('friend', { type: () => ID }) friend: string,
  ) {
    const isFriendRequestSent =
      await this.friendService.checkIsFriendRequestSent(owner.sub, friend);

    return { isFriendRequestSent };
  }

  @Query(() => IsFriendRequestSentToMe)
  async isFriendRequestSentToMe(
    @CurrentUser() owner: IUser,
    @Args('friend', { type: () => ID }) friend: string,
  ) {
    const isFriendRequestSentToMe =
      await this.friendService.checkIsFriendRequestSentToMe(owner.sub, friend);

    return { isFriendRequestSentToMe, friend };
  }

  @Query(() => IsMyFriend)
  async isMyFriend(
    @CurrentUser() owner: IUser,
    @Args('friend', { type: () => ID }) friend: string,
  ) {
    const isMyFriend = await this.friendService.checkIsMyFriend(
      owner.sub,
      friend,
    );

    return { isMyFriend };
  }

  @Mutation(() => Success)
  async sendFriendRequest(
    @CurrentUser() sender: IUser,
    @Args('recipient', { type: () => ID }) recipient: string,
  ) {
    await this.friendService.sendRequest(recipient, sender.sub);
    return {
      message: 'Friend request is sent',
      code: 'FRIENDS_SEND_REQUEST_SUCCESS',
    };
  }

  @Mutation(() => Success)
  async approveFriendRequest(
    @CurrentUser() recipient: IUser,
    @Args('friend', { type: () => ID }) friend: string,
  ) {
    await this.friendService.approve(recipient.sub, friend);

    return {
      message: 'Friend request is approved',
      code: 'FRIENDS_SEND_REQUEST_IS_APPROVED',
    };
  }

  @Mutation(() => Success)
  async rejectFriendRequest(
    @CurrentUser() recipient: IUser,
    @Args('sender', { type: () => ID }) sender: string,
  ) {
    await this.friendService.reject(recipient.sub, sender);
    return {
      message: 'Friend request is rejected',
      code: 'FRIENDS_SEND_REQUEST_IS_REJECTED',
    };
  }

  @Mutation(() => Success)
  async cancelOutgoingFriendRequest(
    @CurrentUser() recipient: IUser,
    @Args('sender', { type: () => ID }) sender: string,
  ) {
    await this.friendService.cancelOutgoingRequest(recipient.sub, sender);
    return {
      message: 'Friend request is cancelled',
      code: 'FRIENDS_SEND_REQUEST_IS_CANCELLED',
    };
  }

  @Mutation(() => Success)
  async removeFromFriends(
    @CurrentUser() me: IUser,
    @Args('friend', { type: () => ID }) friend: string,
  ) {
    await this.friendService.removeFromFriends(me.sub, friend);

    return {
      message: 'Friend is removed',
      code: 'FRIEND_IS_REMOVED',
    };
  }
}

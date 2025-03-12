import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, Repository } from 'typeorm';
import { FriendEntity, FriendRequestEntity } from './models/friend.entity';
import { UserConnection } from '../dto/user.dto';
import { FriendParams } from './interfaces/friend.input';
import { AccountEntity } from '../models/account.entity';
import { ChatEntity } from '../../chat/models/chat.entity';
import { EventService } from '../../event/event.service';
import { isUUIDv4 } from '../../utils';
import { ActionService } from '../../action/action.service';
import { Action } from '../../action/enums';

@Injectable()
export class FriendService {
  constructor(
    private actionService: ActionService,
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    @InjectRepository(FriendEntity)
    private readonly friendRepository: Repository<FriendEntity>,
    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,
    @InjectRepository(FriendRequestEntity)
    private readonly friendRequestRepository: Repository<FriendRequestEntity>,
    private readonly eventService: EventService,
  ) {}

  async getMyIncomingRequests(id: string) {
    const incomingRequests = await this.friendRequestRepository.find({
      where: { recipient: id },
    });

    const ids = incomingRequests.map((r) => r.sender);

    const node = await this.accountRepository.findByIds(ids);

    return {
      edges: {
        node,
      },
    };
  }

  async getMyOutgoingRequests(id: string) {
    const incomingRequests = await this.friendRequestRepository.find({
      where: { sender: id },
    });

    const ids = incomingRequests.map((r) => r.recipient);

    const node = await this.accountRepository.findByIds(ids);

    return {
      edges: {
        node,
      },
    };
  }

  async checkIsFriendRequestSent(me: string, friend: string) {
    let friendId;

    if (!isUUIDv4(friend)) {
      const foundUser = await this.accountRepository.findOne({
        custom_url: friend,
      });
      friendId = foundUser.id;
    } else {
      friendId = friend;
    }

    const result = await this.friendRequestRepository.count({
      where: { recipient: friendId, sender: me },
    });

    return result > 0;
  }

  async checkIsFriendRequestSentToMe(me: string, friend: string) {
    let friendId = '';

    if (!isUUIDv4(friend)) {
      const foundUser = await this.accountRepository.findOne({
        custom_url: friend,
      });
      friendId = foundUser.id;
    } else {
      friendId = friend;
    }

    const result = await this.friendRequestRepository.count({
      where: { recipient: me, sender: friendId },
    });

    return result > 0;
  }

  async checkIsMyFriend(me: string, friend: string) {
    let friendId;

    if (!isUUIDv4(friend)) {
      const foundUser = await this.accountRepository.findOne({
        custom_url: friend,
      });
      friendId = foundUser.id;
    } else {
      friendId = friend;
    }

    const result = await this.friendRepository.count({
      where: [
        { owner: me, friend: friendId },
        { owner: friendId, friend: me },
      ],
    });

    return result > 0;
  }

  async sendRequest(recipient: string, sender: string) {
    if (!sender) {
      throw new BadRequestException({
        message: 'Sender is undefined',
        code: 'FRIENDS_SEND_REQUEST_SENDER_UNDEFINED',
      });
    }

    if (!recipient) {
      throw new BadRequestException({
        message: 'Recipient is undefined',
        code: 'FRIENDS_SEND_REQUEST_RECIPIENT_UNDEFINED',
      });
    }

    const isRequestSent = await this.friendRequestRepository.findOne({
      where: { sender, recipient },
    });

    if (isRequestSent) {
      throw new BadRequestException({
        message: 'Friend request already sent',
        code: 'FRIEND_REQUEST_ALREADY_SENT',
      });
    }

    const friend = await this.friendRepository.findOne({
      relations: ['userFriend'],
      where: { owner: sender, friend: recipient },
    });

    if (friend) {
      throw new BadRequestException({
        message: 'Already friends',
        code: 'FRIENDS_APPROVE_ALREADY_FRIENDS',
      });
    }

    this.actionService
      .addBonus({
        actionId: Action.INVITE_FRIEND,
        userId: recipient,
      })
      .subscribe();

    await this.friendRequestRepository.insert({ sender, recipient });

    const userToNotify = await this.accountRepository.findOne({
      id: recipient,
    });
    const userSender = await this.accountRepository.findOne({ id: sender });

    this.eventService
      .sendNotifyAddFriendRequest(userToNotify, userSender)
      .then();
  }

  async approve(recipient: string, sender: string) {
    if (!sender) {
      throw new BadRequestException({
        message: 'Sender is undefined',
        code: 'FRIENDS_APPROVE_SENDER_UNDEFINED',
      });
    }

    if (!recipient) {
      throw new BadRequestException({
        message: 'Recipient is undefined',
        code: 'FRIENDS_APPROVE_RECIPIENT_UNDEFINED',
      });
    }

    if (sender === recipient) {
      throw new BadRequestException({
        message: 'You trying to be a friend to yourself',
        code: 'FRIENDS_APPROVE_SENDER_IS_YOU',
      });
    }

    await getManager().transaction(async (t) => {
      // Remove both incoming requests if exists
      await t.delete(FriendRequestEntity, {
        recipient: recipient,
        sender: sender,
      });
      await t.delete(FriendRequestEntity, {
        recipient: sender,
        sender: recipient,
      });

      // Add to friend with two DB records (both direction)
      await t.insert(FriendEntity, { owner: recipient, friend: sender });
      await t.insert(FriendEntity, { owner: sender, friend: recipient });
    });

    const userToNotify = await this.accountRepository.findOne({ id: sender });
    const userSender = await this.accountRepository.findOne({ id: recipient });

    this.eventService
      .sendNotifyApprovedFriendRequest(userToNotify, userSender)
      .then();
  }

  async reject(recipient: string, sender: string) {
    if (!sender) {
      throw new BadRequestException({
        message: 'Sender is undefined',
        code: 'FRIENDS_SEND_REJECT_SENDER_UNDEFINED',
      });
    }
    if (!recipient) {
      throw new BadRequestException({
        message: 'Recipient is undefined',
        code: 'FRIENDS_SEND_REJECT_RECIPIENT_UNDEFINED',
      });
    }
    await getManager().transaction(async (t) => {
      await t.delete(FriendEntity, { owner: recipient, friend: sender });
      await t.delete(FriendEntity, { owner: sender, friend: recipient });
      await t.delete(FriendRequestEntity, { recipient, sender });
    });
    this.eventService.emit('onFriendReject', recipient, sender);
  }

  async cancelOutgoingRequest(
    recipient: string, // User
    sender: string, // Who send friend request
  ) {
    if (!sender) {
      throw new BadRequestException({
        message: 'Sender is undefined',
        code: 'FRIENDS_SEND_REJECT_SENDER_UNDEFINED',
      });
    }

    if (!recipient) {
      throw new BadRequestException({
        message: 'Recipient is undefined',
        code: 'FRIENDS_SEND_REJECT_RECIPIENT_UNDEFINED',
      });
    }

    await getManager().delete(FriendRequestEntity, {
      recipient: sender,
      sender: recipient,
    });
  }

  async removeFromFriends(me: string, friend: string) {
    if (!me) {
      throw new BadRequestException({
        message: 'Me is undefined',
        code: 'FRIENDS_APPROVE_SENDER_UNDEFINED',
      });
    }

    if (!friend) {
      throw new BadRequestException({
        message: 'friend is undefined',
        code: 'FRIENDS_APPROVE_RECIPIENT_UNDEFINED',
      });
    }

    if (me === friend) {
      throw new BadRequestException({
        message: 'You trying to remove yourself from your friends',
        code: 'REMOVING_FRIEND_IS_YOU',
      });
    }

    await getManager().transaction(async (t) => {
      await t.delete(FriendEntity, { owner: me, friend: friend });
      await t.delete(FriendEntity, { owner: friend, friend: me });
    });
  }

  async myFriend(owner: string, friend: string): Promise<FriendEntity> {
    return this.friendRepository.findOne({
      relations: ['userOwner', 'userFriend'],
      where: { owner, friend },
    });
  }

  async getFriendsByUserId(
    user_id: string,
    params: FriendParams,
  ): Promise<UserConnection> {
    const [node, totalCount] = await this.friendRepository.findAndCount({
      relations: ['userFriend'],
      where: { owner: user_id },
      ...(params?.offset ? { skip: params?.offset * params?.first } : {}),
      ...(params?.first ? { take: params?.first } : {}),
    });

    const _node = await Promise.all(
      node.map(async (n) => {
        n.userFriend.unreadCount = await this.chatRepository.count({
          where: {
            is_read: false,
            sender_id: n.friend,
            recipient_id: user_id,
          },
        });
        const message = await this.chatRepository.findOne({
          select: ['context', 'create_time'],
          where: [
            { sender_id: n.friend, recipient_id: user_id },
            { sender_id: user_id, recipient_id: n.friend },
          ],
          order: {
            create_time: 'DESC',
          },
        });
        n.userFriend.last_message = message?.context;
        n.userFriend.message_create_time = message?.create_time;
        return n.userFriend;
      }),
    );

    return {
      totalCount,
      edges: {
        node: _node.sort((p, l) => {
          return l.create_time.getTime() - p.create_time.getTime();
        }),
      },
      pageInfo: {
        hasNextPage:
          params?.first * params?.offset + params?.first < totalCount,
      },
    };
  }

  async isFriendRequestSent(
    sender: string,
    recipient: string,
  ): Promise<FriendRequestEntity> {
    return this.friendRequestRepository.findOne({
      where: { sender, recipient },
    });
  }
}

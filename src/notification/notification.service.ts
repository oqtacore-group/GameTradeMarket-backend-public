import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository, getManager } from 'typeorm';
import moment from 'moment';

import { isUUIDv4 } from '../utils';
import { NotificationEntity } from './models/notification.entity';
import { AccountEntity } from '../account/models/account.entity';
import { ChatEntity } from '../chat/models/chat.entity';
import { AccountService } from '../account/account.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,
    private readonly accountService: AccountService,
  ) {}

  // Get all notifications for user
  notificationsGetAllByUserId(userId: string): Promise<NotificationEntity[]> {
    return this.notificationRepository.find({
      select: ['id', 'type', 'body', 'title', 'create_time', 'type', 'data'],
      where: { user_id: userId },
      order: { id: 'DESC' },
    });
  }

  // Notify that somebody send friend request to user
  notifyAddFriendRequest(
    userToNotify: Partial<AccountEntity>,
    userSender: Partial<AccountEntity>,
  ): Promise<NotificationEntity> {
    const notify = this.notificationRepository.create({
      user_id: userToNotify.id,
      title: `Friend request from ${userSender.nick_name}`,
      body: `${userSender.nick_name} sent you a friend request`,
      type: 'FRIEND_REQUEST_SENT',
      data: {
        senderId: userSender.id,
        customUrl: userSender.custom_url,
      },
    });

    return this.notificationRepository.save(notify);
  }

  // Notify that user's friend request approved
  notifyApprovedFriendRequest(
    userToNotify: Partial<AccountEntity>,
    userSender: Partial<AccountEntity>,
  ): Promise<NotificationEntity> {
    const notify = this.notificationRepository.create({
      user_id: userToNotify.id,
      title: `${userSender.nick_name} approved your friend request`,
      body: `Your friend request to ${userSender.nick_name} has just been approved! Start communicating via chat`,
      type: 'FRIEND_REQUEST_APPROVED',
      data: {
        senderId: userSender.id,
      },
    });

    return this.notificationRepository.save(notify);
  }

  // Notify that user's item was sold
  notifyBuyToken(
    user: Partial<AccountEntity>,
    tokenId: number,
  ): Promise<NotificationEntity> {
    const notify = this.notificationRepository.create({
      user_id: user.id,
      title: `Your item was sold!`,
      body: `We have just found a buyer for ${tokenId}`,
      type: 'BUY_TOKEN',
    });
    return this.notificationRepository.save(notify);
  }

  // Notify that user have new message
  notifyAddMessageChat(
    user: Partial<AccountEntity>,
    senderName: string,
    message: string,
    data: { [k: string]: any },
  ): Promise<NotificationEntity> {
    const notify = this.notificationRepository.create({
      user_id: user.id,
      title: `New message from ${senderName}`,
      body: message.length > 50 ? message.substring(0, 50) : message,
      type: 'NEW_MESSAGE',
      data,
    });

    return this.notificationRepository.save(notify);
  }

  // Clear notification with selected id
  notificationClear(id: number) {
    return this.notificationRepository.delete(id);
  }

  // Clear notifications from 'id' and earlier with type NEW_MESSAGE
  notificationsClearThisAndEalierWithTypeNewMessage(id: number) {
    return this.notificationRepository.delete({
      id: LessThanOrEqual(id),
      type: 'NEW_MESSAGE',
    });
  }

  // Clear notifications this and earlier from sender with type NEW_MESSAGE
  notificationsClearThisAndEarlierFromSender(id: number, senderId: string) {
    return getManager().query(`
      DELETE FROM account.notifications
        WHERE id <= ${id} AND data::json->>'senderId' = '${senderId}'
    `);
  }

  // Clear all notifications with type NEW_MESSAGE
  notificationsClearAllWithTypeNewMessage() {
    return this.notificationRepository.delete({ type: 'NEW_MESSAGE' });
  }

  // Clear all notifications with type FRIEND_REQUEST_SENT
  notificationsClearAllWithTypeFriendRequestSent() {
    return this.notificationRepository.delete({ type: 'FRIEND_REQUEST_SENT' });
  }

  async notificationClearFriendRequestSentFromSender(
    senderIdOrCustomUrl: string,
  ) {
    let senderId = senderIdOrCustomUrl;

    if (!isUUIDv4(senderIdOrCustomUrl)) {
      const user = await this.accountService.getUserByCustomUrl(
        senderIdOrCustomUrl,
      );
      senderId = user.id;
    }

    return getManager().query(`
      DELETE FROM account.notifications
        WHERE data::json->>'senderId' = '${senderId}'
    `);
  }

  // Clear all notifications with type FRIEND_REQUEST_APPROVED
  notificationsClearAllWithTypeFriendRequestApproved() {
    return this.notificationRepository.delete({
      type: 'FRIEND_REQUEST_APPROVED',
    });
  }

  // Clear all outdated notifications
  notificationsClearAllOutdated() {
    const create_time = moment().subtract(14, 'days').toDate();

    return this.notificationRepository.delete({
      create_time: LessThanOrEqual(create_time),
    });
  }

  // Mark selected messageId and earlier from selected sender as read
  messagesMarkAsReadFromSenderThisAndEarlier(data: { [k: string]: any }) {
    return this.chatRepository.update(
      {
        id: LessThanOrEqual(data.messageId),
        sender_id: data.senderId,
      },
      {
        is_read: true,
      },
    );
  }
}

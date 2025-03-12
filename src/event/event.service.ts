import { Injectable, Logger } from '@nestjs/common';
import { EventGateway } from './event.gateway';
import { AccountEntity } from '../account/models/account.entity';
import { NotificationService } from '../notification/notification.service';
import { InventoryEntity } from '../inventory/models/inventory.entity';

@Injectable()
export class EventService {
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly notificationService: NotificationService,
  ) {}

  private logger = new Logger(EventService.name);
  private readonly notifyEvent = 'onMarketEvent';

  emit(event: string, to: string, message: any) {
    if (this.eventGateway.USERS[to]) {
      this.eventGateway.eventEmitter.sockets
        .to(this.eventGateway.USERS[to])
        .emit(event, message);
    }
  }

  async sendNotifyAddFriendRequest(
    userToNotify: AccountEntity,
    userSender: AccountEntity,
  ) {
    if (!userToNotify || !userSender) return;

    const notify = await this.notificationService.notifyAddFriendRequest(
      userToNotify,
      userSender,
    );

    this.emit(this.notifyEvent, userToNotify.id, {
      ...notify,
      data: {
        senderId: userSender.id,
        customUrl: userSender.custom_url,
      },
    });

    this.logger.debug(`sendNotifyAddFriendRequest => ok`);
  }

  async sendNotifyApprovedFriendRequest(
    userToNotify: AccountEntity,
    userSender: AccountEntity,
  ) {
    if (!userToNotify || !userSender) return;

    const notify = await this.notificationService.notifyApprovedFriendRequest(
      userToNotify,
      userSender,
    );

    this.emit(this.notifyEvent, userToNotify.id, {
      ...notify,
    });

    this.logger.debug(`sendNotifyApprovedFriendRequest => ok`);
  }

  async sendNotifyBuyToken(user: AccountEntity, token: InventoryEntity) {
    if (!user) return;

    const notify = await this.notificationService.notifyBuyToken(
      user,
      token.id,
    );

    this.emit(this.notifyEvent, user.id, {
      ...notify,
    });

    this.logger.debug(`sendNotifyBuyToken => ok`);
  }

  async sendNotifyAddMessageChat(
    user: AccountEntity,
    senderName: string,
    message: string,
    data: { [k: string]: any },
  ) {
    if (!user) return;

    const notify = await this.notificationService.notifyAddMessageChat(
      user,
      senderName,
      message,
      data,
    );

    this.emit(this.notifyEvent, user.id, {
      ...notify,
    });

    this.logger.debug(`sendNotifyAddMessageChat => ok`);
  }
}

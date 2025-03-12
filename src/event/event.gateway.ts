import { UseGuards } from '@nestjs/common';
import {
  OnGatewayInit,
  OnGatewayDisconnect,
  WebSocketServer,
  WebSocketGateway,
  WsException,
  SubscribeMessage,
} from '@nestjs/websockets';
import { PATH_EVENT } from '../utils/constants';
import { AuthService } from '../auth/auth.service';
import { IUser } from '../auth/interfaces/user.interface';
import { Server } from 'socket.io';
import { MarkAsReadNotifyArgs } from './dto/event.dto';
import { NotificationService } from '../notification/notification.service';
import { WsAuthGuard } from '../auth/auth.guard';

@WebSocketGateway({
  path: PATH_EVENT,
  credentials: true,
  transports: ['polling'],
  cors: {
    origin: (origin, callback) => {
      const _origins = process.env.CORS_ORIGINS.split(',');
      if (!origin || _origins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error(`${origin} Not allowed by CORS`));
      }
    },
  },
})
export class EventGateway implements OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  eventEmitter: Server;

  USERS = {};
  constructor(
    private readonly notificationService: NotificationService,
    private readonly authService: AuthService,
  ) {}

  afterInit(server: Server) {
    server.use(async (socket, next) => {
      const _token =
        socket.handshake.auth.authorization ||
        socket.handshake.auth.Authorization;
      if (!_token) {
        socket.disconnect();
      }
      const user = await this.authService.verifyAccessToken(_token);
      if (!user) return next(new WsException('unauthorized'));
      const _user_id = (user as IUser).sub;
      this.USERS[_user_id] = socket.id;
      socket['user'] = _user_id;
      this.sendAllUnReadNotifications(_user_id).then();
      return next();
    });
  }

  handleDisconnect(client) {
    if (client.user) {
      delete this.USERS[client.user];
    }
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('notificationClear')
  async handlerOnMarkAsRead(_client, { id }: MarkAsReadNotifyArgs) {
    return this.notificationService.notificationClear(id);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('notificationsClearAllWithTypeNewMessage')
  async handlerOnClearAllNewMessageNotifications() {
    return this.notificationService.notificationsClearAllWithTypeNewMessage();
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('notificationsClearAllWithTypeFriendRequestSent')
  async handlerOnClearAllFriendRequestSentNotifications() {
    return this.notificationService.notificationsClearAllWithTypeFriendRequestSent();
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('notificationClearFriendRequestSentFromSender')
  async handlerOnClearNotificationFriendRequestSentFromSender(
    _client,
    data: any,
  ) {
    return this.notificationService.notificationClearFriendRequestSentFromSender(
      data.senderIdOrCustomUrl,
    );
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('notificationsClearAllWithTypeFriendRequestApproved')
  async handlerOnClearAllFriendRequestApprovedNotifications() {
    return this.notificationService.notificationsClearAllWithTypeFriendRequestApproved();
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('notificationsClearThisAndEalierWithTypeNewMessage')
  async handlerOnNotificationsClearThisAndEalierWithTypeNewMessage(
    _client,
    data: any,
  ) {
    await this.notificationService.notificationsClearThisAndEalierWithTypeNewMessage(
      data,
    );
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('notificationsClearThisAndEarlierFromSender')
  async handlerOnNotificationsClearThisAndEarlierFromSender(
    _client,
    data: any,
  ) {
    await this.notificationService.notificationsClearThisAndEarlierFromSender(
      data.id,
      data.senderId,
    );
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('messagesMarkAsReadFromSenderThisAndEarlier')
  async handlerOnMessagesMarkAsReadFromSenderThisAndEarlier(
    _client,
    data: any,
  ) {
    await this.notificationService.messagesMarkAsReadFromSenderThisAndEarlier(
      data,
    );
  }

  async sendAllUnReadNotifications(recipient: string) {
    const notifications =
      await this.notificationService.notificationsGetAllByUserId(recipient);

    if (notifications.length > 0) {
      this.eventEmitter
        .to(this.USERS[recipient])
        .emit('onNotifications', notifications);
    }
  }
}

import {
  OnGatewayInit,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketServer,
  WebSocketGateway,
  WsException,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { ChatSendTextArgs } from './chat.interface';
import { PATH_CHAT } from '../utils/constants';
import { AuthService } from '../auth/auth.service';
import { IUser } from '../auth/interfaces/user.interface';
import { FriendService } from '../account/friend/friend.service';
import { Server } from 'socket.io';
import { UseFilters } from '@nestjs/common';
import { WebsocketExceptionsFilter } from './chat.filter';

@WebSocketGateway({
  path: PATH_CHAT,
  credentials: true,
  transports: ['polling', 'websocket'],
  secure: true,
  cors: {
    origin: (origin, callback) => {
      // TODO maybe shouldn't access the server this way
      const _origins = process.env.CORS_ORIGINS.split(',');
      if (!origin || _origins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error(`${origin} Not allowed by CORS`));
      }
    },
  },
})
@UseFilters(WebsocketExceptionsFilter)
export class ChatGateway implements OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  USERS = {};
  constructor(
    private readonly friendService: FriendService,
    private readonly authService: AuthService,
    private readonly chatService: ChatService,
  ) {}

  afterInit(server: Server) {
    server.use(async (socket, next) => {
      const _token =
        socket.handshake.auth.authorization ||
        socket.handshake.auth.Authorization;
      if (!_token) socket.disconnect();
      const user = await this.authService.verifyAccessToken(_token);
      if (!user) return next(new WsException('unauthorized'));
      const _user_id = (user as IUser).sub;
      this.USERS[_user_id] = socket.id;
      socket['user'] = _user_id;
      this.sendOnlineByFriends(_user_id).then();
      return next();
    });
  }

  @SubscribeMessage('textSend')
  async textSend(client, { recipient, context }: ChatSendTextArgs) {
    const message = await this.chatService.textSend(
      client.user,
      recipient,
      context,
    );
    // FIXME create a common emitter method
    if (message && this.USERS[recipient]) {
      client.to(this.USERS[recipient]).emit('onSent', message);
    }
  }

  // @SubscribeMessage('audioSend')
  // async audioSend(client, { recipient, context }: ChatSendMediaArgs) {
  //   const _context: Buffer = Buffer.from(context, 'base64');
  //   const message = await this.chatService.audioSend(
  //     client.user,
  //     recipient,
  //     _context,
  //   );
  //   if (message && USERS[recipient]) {
  //     client.to(USERS[recipient]).emit('onSent', message);
  //     console.info(`Send => from ${client.user} to ${recipient}`);
  //   }
  // }
  //
  // @SubscribeMessage('imageSend')
  // async imageSend(client, { recipient, context }: ChatSendMediaArgs) {
  //   const _context: Buffer = Buffer.from(context, 'base64');
  //   const message = await this.chatService.imageSend(
  //     client.user,
  //     recipient,
  //     _context,
  //   );
  //   if (message && USERS[recipient]) {
  //     client.to(USERS[recipient]).emit('onSent', message);
  //     console.info(`Send => from ${client.user} to ${recipient}`);
  //   }
  // }

  @SubscribeMessage('getMessages')
  async getMessages(client, { recipient, offset, first }): Promise<void> {
    client.emit(
      'onGetMessages',
      await this.chatService.getMessages(client.user, recipient, offset, first),
    );
  }

  private async sendOnlineByFriends(sender: string) {
    const _friends = await this.friendService.getFriendsByUserId(sender, {});
    // TODO when there's a common socket, move it there
    await this.authService.accountRepository.update(
      { id: sender },
      { online_time: new Date() },
    );
    const _online_friends = _friends.edges.node.filter(
      ({ id }) => !!this.USERS[id],
    );
    _online_friends.map(({ id }) =>
      this.server.to(this.USERS[id]).emit('online', sender),
    );
    if (!_online_friends.length) return;
    this.server.to(this.USERS[sender]).emit(
      'online',
      _online_friends.map(({ id }) => id),
    );
  }

  private async senderOffline(sender: string) {
    const friends = await this.friendService.getFriendsByUserId(sender, {});
    // TODO when there's a common socket, move it there
    await this.authService.accountRepository.update(
      { id: sender },
      { last_visited: new Date() },
    );
    friends.edges.node
      .filter(({ id }) => !!this.USERS[id])
      .map(({ id }) => this.server.to(this.USERS[id]).emit('offline', sender));
  }

  handleDisconnect(client) {
    if (client.user) {
      this.senderOffline(client.user).then();
      delete this.USERS[client.user];
    }
  }
}

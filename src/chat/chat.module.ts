import { Module, forwardRef } from '@nestjs/common';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatEntity } from './models/chat.entity';
import { AuthModule } from '../auth/auth.module';
import { ChatGateway } from './chat.gateway';
import { ConfigModule } from '@nestjs/config';
import { FriendModule } from '../account/friend/friend.module';
import { EventModule } from '../event/event.module';
import { ChatController } from './chat.controller';

@Module({
  imports: [
    AuthModule,
    ConfigModule,
    FriendModule,
    forwardRef(() => EventModule),
    TypeOrmModule.forFeature([ChatEntity]),
  ],
  providers: [ChatGateway, ChatService],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}

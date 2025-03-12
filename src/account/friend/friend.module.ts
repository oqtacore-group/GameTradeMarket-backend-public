import { Module, forwardRef } from '@nestjs/common';
import { FriendService } from './friend.service';
import { FriendResolver } from './friend.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendEntity, FriendRequestEntity } from './models/friend.entity';
import { AuthModule } from '../../auth/auth.module';
import { AccountEntity } from '../models/account.entity';
import { ChatEntity } from '../../chat/models/chat.entity';
import { EventModule } from '../../event/event.module';
import { ActionModule } from '../../action/action.module';

@Module({
  imports: [
    AuthModule,
    ActionModule,
    forwardRef(() => EventModule),
    TypeOrmModule.forFeature([
      AccountEntity,
      FriendEntity,
      FriendRequestEntity,
      ChatEntity,
    ]),
  ],
  providers: [FriendService, FriendResolver],
  exports: [FriendService],
})
export class FriendModule {}

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatEntity } from 'src/chat/models/chat.entity';
import { NotificationEntity } from './models/notification.entity';
import { NotificationService } from './notification.service';
import { AccountModule } from '../account/account.module';

@Module({
  imports: [
    forwardRef(() => AccountModule),
    TypeOrmModule.forFeature([NotificationEntity, ChatEntity]),
  ],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}

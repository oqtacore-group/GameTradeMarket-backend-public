import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { AuthModule } from '../auth/auth.module';
import { EventGateway } from './event.gateway';
import { ConfigModule } from '@nestjs/config';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [AuthModule, ConfigModule, NotificationModule],
  providers: [EventGateway, EventService],
  exports: [EventService],
})
export class EventModule {}

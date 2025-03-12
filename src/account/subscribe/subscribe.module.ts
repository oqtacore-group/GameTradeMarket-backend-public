import { Module } from '@nestjs/common';
import { SubscribeService } from './subscribe.service';
import { SubscribeResolver } from './subscribe.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  SubscribeEntity,
  UserSubscribeEntity,
} from './models/subscribe.entity';
import { MailchimpService } from './mailchimp.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    TypeOrmModule.forFeature([SubscribeEntity, UserSubscribeEntity]),
  ],
  providers: [SubscribeService, MailchimpService, SubscribeResolver],
  exports: [MailchimpService],
})
export class SubscribeModule {}

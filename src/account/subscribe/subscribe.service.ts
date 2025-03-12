import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SubscribeEntity,
  UserSubscribeEntity,
} from './models/subscribe.entity';
import { MailchimpService } from './mailchimp.service';
import { WriteToUsParams } from './interfaces/write-to-us.input';

@Injectable()
export class SubscribeService {
  private logger = new Logger(SubscribeService.name);
  constructor(
    private readonly mailchimpService: MailchimpService,
    @InjectRepository(SubscribeEntity)
    private readonly subscribeRepository: Repository<SubscribeEntity>,
    @InjectRepository(UserSubscribeEntity)
    private readonly userSubscribeRepository: Repository<UserSubscribeEntity>,
  ) {}

  async subscribe({ text: body, k8bd2, name }: WriteToUsParams) {
    await this.subscribeRepository.insert({ body, email: k8bd2, name });
  }

  async addUserSubscribe(email: string) {
    //TODO create transaction verification for mailchimp creation, generally look into using a queue
    try {
      await this.mailchimpService.addContact(email);
      await this.userSubscribeRepository.insert({ email });
      return {
        message: 'You subscribed',
        code: 'USER_IS_SUBSCRIBED',
      };
    } catch {
      return {
        message: 'You subscribed failure',
        code: 'USER_IS_SUBSCRIBED_ERROR',
      };
    }
  }
}

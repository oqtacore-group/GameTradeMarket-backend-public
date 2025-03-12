import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { SubscribeService } from './subscribe.service';
import { SubscribeParams } from './interfaces/subscribe.input';
import { WriteToUsParams } from './interfaces/write-to-us.input';
import { Success } from '../../utils/interfaces/response.interface';

@Resolver('Subscribe')
export class SubscribeResolver {
  constructor(private readonly subscribeService: SubscribeService) {}

  @Mutation(() => Success)
  subscribe(@Args('params') { k8bd2 }: SubscribeParams) {
    return this.subscribeService.addUserSubscribe(k8bd2);
  }

  @Mutation(() => Success)
  async writeToUs(@Args('params') params: WriteToUsParams) {
    await this.subscribeService.subscribe(params);
    return {
      message: 'Your message is sent',
      code: 'YOUR_MESSAGE_IS_SENT',
    };
  }
}

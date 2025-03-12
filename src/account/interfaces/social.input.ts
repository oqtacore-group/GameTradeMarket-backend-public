import { SocialKind } from '../models/account.entity';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SocialParams {
  @Field(() => SocialKind)
  kind?: SocialKind;
  @Field(() => String)
  value: string;
}

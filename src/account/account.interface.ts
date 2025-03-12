import { Field, ObjectType } from '@nestjs/graphql';
import { SocialKind } from './models/account.entity';

export interface IAccountUser {
  bio?: string;
  custom_url?: string;
  email?: string;
  email_verified?: boolean;
  google_sub?: string;
  image_url?: string;
  last_visited?: Date;
  locale?: string;
  mail_code?: number;
  mail_code_tries?: number;
  nick_name?: string;
  online_time?: Date;
  password?: string;
  password_code?: number;
  password_code_tries?: number;
  referrerLink?: string;
  promoCode?: string;
  invitedBy?: string;
  social?: Record<string, any>[];
  player_token?: string;
}

@ObjectType()
export class UserSocial {
  @Field(() => SocialKind)
  kind: SocialKind;
  @Field(() => String)
  value: string;
}

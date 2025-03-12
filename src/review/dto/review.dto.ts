import { ObjectType, PickType } from '@nestjs/graphql';
import { AccountEntity } from '../../account/models/account.entity';

@ObjectType()
export class ReviewOwnerDto extends PickType(AccountEntity, [
  'image_url',
  'nick_name',
  'custom_url',
] as const) {}

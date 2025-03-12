import { Field, ID, InputType } from '@nestjs/graphql';
import { SocialParams } from './social.input';
import { IsEmail, IsOptional } from 'class-validator';
import { PaginationParams } from '../../utils/interfaces/utils.interface';

@InputType()
export class UserParams {
  @Field(() => String, { nullable: true })
  nick_name?: string;

  @IsOptional()
  @IsEmail()
  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  image_url?: string;

  @Field(() => String, { nullable: true })
  password?: string;

  @Field(() => String, { nullable: true })
  bio?: string;

  @Field(() => String, { nullable: true })
  custom_url?: string;

  @Field(() => String, { nullable: true })
  locale?: string;

  @Field(() => [SocialParams], { nullable: 'itemsAndList' })
  social?: Record<string, any>[];
}

@InputType()
export class UserFilters extends PaginationParams {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field(() => String, { nullable: true })
  custom_url?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  nick_name?: string;

  @Field(() => String, { nullable: true })
  create_date_from?: string;

  @Field(() => Boolean, { nullable: true })
  hide_me?: boolean;
}

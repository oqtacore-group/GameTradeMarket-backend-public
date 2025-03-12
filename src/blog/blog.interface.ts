import { Field, InputType, Int, OmitType, PickType } from '@nestjs/graphql';
import { BlogEntity } from './models/blog.entity';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';
import { Currency } from '../inventory/interfaces/card.interface';
import { Genre, MediaLink, SocialLink } from '../source/dto/source.dto';

@InputType()
export class CreateBlogParams extends OmitType(BlogEntity, [
  'id',
  'create_time',
]) {
  @IsUUID(4)
  @Field(() => String)
  readonly user_id: string;

  @IsString()
  @Field(() => String)
  readonly game_code: string;

  @IsOptional()
  @IsUrl()
  @Field(() => String, { nullable: true })
  readonly external_url?: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  readonly description: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  readonly img_url: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  readonly title: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  readonly sub_title?: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  readonly create_time?: string;

  @IsBoolean()
  @Field(() => Boolean)
  readonly is_published: boolean;
}

@InputType()
export class UpdateBlogParams extends OmitType(BlogEntity, [
  'user_id',
  'create_time',
]) {
  @IsInt()
  @Field(() => Int)
  readonly id: number;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  readonly description: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  readonly img_url: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  readonly title: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  readonly sub_title: string;

  @IsBoolean()
  @Field(() => Boolean)
  readonly is_published: boolean;
}

@InputType()
export class DeleteBlogParams extends PickType(BlogEntity, ['id']) {
  @IsInt()
  @Field(() => Int)
  readonly id: number;
}

@InputType()
export class GetAllBlogParams {
  @Field(() => String, { nullable: true })
  readonly gameCode?: string;
}

@InputType()
export class GetLastMediumBlogParams {
  @Field(() => String, { nullable: true })
  readonly gameCode?: string;
}

@InputType()
export class CreateGameParams {
  @Field(() => String)
  readonly name: string;

  @Field(() => String)
  readonly publisher: string;

  @Field(() => String)
  readonly developer: string;

  @Field(() => String)
  readonly description: string;

  @Field(() => String)
  readonly blockchain: Currency;

  @Field(() => String)
  readonly release_date: string;

  @Field(() => [SocialLink], { nullable: 'items' })
  readonly social_links: SocialLink[];

  @Field(() => Genre)
  readonly genre: Genre;

  @Field(() => [MediaLink], { nullable: 'items' })
  readonly media_links: MediaLink[];

  @Field(() => String)
  readonly logo: string;

  @Field(() => Boolean)
  readonly admitted_to_trading: boolean;
}

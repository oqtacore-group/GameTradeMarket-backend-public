import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MarketBlog {
  @Field(() => ID)
  id: number;
  @Field(() => String)
  external_url: string;
  @Field(() => String)
  description: string;
  @Field(() => String)
  title: string;
  @Field(() => String)
  img_url: string;
  @Field(() => Boolean)
  is_published: boolean;
  @Field(() => String)
  create_time: string;
}

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SlideMetaButton {
  @Field(() => String)
  text: string;
  @Field(() => String)
  link: string;
}

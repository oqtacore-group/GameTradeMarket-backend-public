import { SlideMetaButton } from './slide-meta-button.interface';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SlideMeta {
  @Field(() => [SlideMetaButton], { nullable: 'itemsAndList' })
  buttons: SlideMetaButton[];
}

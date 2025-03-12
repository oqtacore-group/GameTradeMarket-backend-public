import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, MaxLength } from 'class-validator';

@InputType()
export class AddItemCommentParams {
  @Field(() => ID)
  item_id: number;

  @IsNotEmpty()
  @MaxLength(2000)
  @Field(() => String)
  message: string;
}

@InputType()
export class RemoveItemCommentParams {
  @Field(() => ID)
  comment_id: number;
}

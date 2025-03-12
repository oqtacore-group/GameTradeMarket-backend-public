import { Action } from '../enums';
import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class AddBonusInput {
  @Field(() => String)
  userId: string;
  @Field(() => Int)
  actionId: Action;
}

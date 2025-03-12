import { Field, ID, InputType } from '@nestjs/graphql';

@InputType({ description: 'Add publisher to game' })
export class AddPublisherOfSourceInput {
  @Field(() => String, { description: 'Game' })
  code: string;
  @Field(() => String, { description: 'User email' })
  user_email: string;
}

@InputType({ description: 'Remove publisher from game' })
export class RemovePublisherOfSourceInput {
  @Field(() => String, { description: 'Game' })
  code: string;
  @Field(() => ID, { description: 'User ID' })
  user_id: string;
}

@InputType({ description: 'List of game publishers' })
export class PublisherUsersParams {
  @Field(() => String, { description: 'Game ID' })
  code: string;
}

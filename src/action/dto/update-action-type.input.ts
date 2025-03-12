import { Field, Float, ID, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateActionTypeInput {
  @Field(() => ID)
  readonly id: number;

  @Field(() => String, { nullable: true })
  readonly name: string;

  @Field(() => Float, { nullable: true })
  readonly limit: number;

  @Field(() => Float, { nullable: true })
  readonly amount: number;

  @Field(() => Boolean, { nullable: true })
  readonly isRequired: boolean;

  @Field(() => Boolean, { nullable: true })
  readonly isPublic: boolean;

  @Field(() => Boolean, { nullable: true })
  readonly isInfinity: boolean;
}

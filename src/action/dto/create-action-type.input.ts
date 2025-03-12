import { Field, Float, InputType } from '@nestjs/graphql';

@InputType()
export class CreateActionTypeInput {
  @Field(() => String)
  readonly name: string;

  @Field(() => Float, { defaultValue: 1 })
  readonly limit = 1;

  @Field(() => Float, { defaultValue: 1 })
  readonly amount = 1;

  @Field(() => Boolean, { defaultValue: false })
  readonly isRequired = false;

  @Field(() => Boolean, { defaultValue: false })
  readonly isInfinity = false;

  @Field(() => Boolean, { defaultValue: false })
  readonly isPublic = false;
}

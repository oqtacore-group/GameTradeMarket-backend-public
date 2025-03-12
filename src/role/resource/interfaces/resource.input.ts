import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ResourceParams {
  @Field(() => String)
  path: string;
  @Field(() => String)
  name: string;
}

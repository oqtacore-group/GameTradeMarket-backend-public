import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Resource {
  @Field(() => String)
  path: string;
  @Field(() => String)
  name: string;
}

@ObjectType()
export class AccessResource {
  @Field(() => String)
  path: string;
}

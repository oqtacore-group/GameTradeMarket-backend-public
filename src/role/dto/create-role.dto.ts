import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class CreateRoleDto {
  @Field()
  message: string;
  @Field()
  code: string;
}

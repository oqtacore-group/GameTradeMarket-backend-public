import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class UpdateRoleDto {
  @Field()
  message: string;
  @Field()
  code: string;
}

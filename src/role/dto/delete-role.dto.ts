import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class DeleteRoleDto {
  @Field()
  message: string;
  @Field()
  code: string;
}

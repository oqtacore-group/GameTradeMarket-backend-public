import { Field, ID, InputType } from '@nestjs/graphql';
import { RoleEnum } from '../role.decorator';
import { IsEmail, IsOptional } from 'class-validator';

@InputType()
export class UserRoleParams {
  @IsOptional()
  @IsEmail()
  @Field(() => String, {
    nullable: true,
    description: 'User email',
  })
  email: string;

  @IsOptional()
  @Field(() => ID, {
    nullable: true,
    description: 'User ID',
  })
  user_id: string;

  @Field(() => [String], { description: 'List of roles' })
  roles: RoleEnum[];
}

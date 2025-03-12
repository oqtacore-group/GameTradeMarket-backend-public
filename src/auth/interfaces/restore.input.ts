import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty } from 'class-validator';

@InputType()
export class RestoreParams {
  @Field(() => String)
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

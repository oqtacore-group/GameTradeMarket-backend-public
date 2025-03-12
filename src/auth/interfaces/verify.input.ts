import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty } from 'class-validator';

@InputType()
export class VerifyParams {
  @Field(() => String)
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @Field(() => Int)
  code: number;
}

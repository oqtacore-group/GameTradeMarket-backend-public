import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

@InputType()
export class ResetParams {
  @Field(() => String)
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @Field(() => String)
  @MinLength(8)
  password: string;
  @Field(() => Int)
  code: number;
}

import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsEmpty } from 'class-validator';

@InputType()
export class SubscribeParams {
  @IsEmpty()
  @Field(() => String)
  email: string;
  @IsEmail()
  @Field(() => String)
  k8bd2: string;
}

import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, MaxLength, MinLength } from 'class-validator';

@InputType()
export class LoginParams {
  @IsEmail()
  @Field(() => String)
  email: string;

  @Field(() => String)
  @MinLength(8)
  @MaxLength(60)
  password: string;

  @Field(() => String, { nullable: true })
  locale?: string = 'en';
}

@InputType()
export class SignupParams {
  @IsEmail()
  @Field(() => String)
  email: string;

  @Field(() => String)
  invitedBy?: string;

  @Field(() => String)
  referrerLink?: string;

  @Field(() => String)
  @MinLength(8)
  @MaxLength(60)
  password: string;

  @Field(() => String, { nullable: true, defaultValue: 'en' })
  locale?: string = 'en';
}

@InputType()
export class LoginByUserParams {
  @Field(() => String, { nullable: true })
  email: string;

  @Field(() => String, { nullable: true })
  id: string;
}

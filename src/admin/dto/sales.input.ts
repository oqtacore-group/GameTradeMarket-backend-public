import { Field, InputType } from '@nestjs/graphql';
import { IsDateString, IsEmail } from 'class-validator';

@InputType()
export class SalesInput {
  @IsEmail()
  @Field(() => String)
  readonly email: string;

  @IsDateString()
  @Field(() => String)
  readonly created_from: string;

  @IsDateString()
  @Field(() => String)
  readonly created_till: string;
}

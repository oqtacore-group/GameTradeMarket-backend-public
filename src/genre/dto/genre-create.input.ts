import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class GenreCreateInput {
  @IsNotEmpty()
  @Field(() => String)
  readonly name: string;
}

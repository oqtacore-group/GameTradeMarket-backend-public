import { Field, InputType } from '@nestjs/graphql';
import { IsInt, IsNotEmpty } from 'class-validator';

@InputType()
export class GenreUpdateInput {
  @IsInt()
  @Field(() => String)
  readonly code: string;
  @IsNotEmpty()
  @Field(() => String)
  readonly name: string;
}

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GetGamesWithNotExistsTokenDto {
  @Field(() => String)
  contract: string;
  @Field(() => String)
  blockchain: string;
}

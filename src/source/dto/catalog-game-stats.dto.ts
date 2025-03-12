import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CatalogGameStats {
  @Field(() => Int, { nullable: true })
  tx_7d?: number;

  @Field(() => Int, { nullable: true })
  tx_30d?: number;

  @Field(() => Int, { nullable: true })
  uaw_7d?: number;

  @Field(() => Int, { nullable: true })
  uaw_30d?: number;
}

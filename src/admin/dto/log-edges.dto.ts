import { Field, ObjectType } from '@nestjs/graphql';
import { Log } from './log.dto';

@ObjectType()
export class LogEdges {
  @Field(() => [Log], { nullable: 'itemsAndList' })
  node?: Log[];
}

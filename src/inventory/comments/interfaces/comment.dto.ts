import { Field, Int, ObjectType, PickType } from '@nestjs/graphql';
import { PageInfo } from '../../../utils/interfaces/utils.interface';
import { CommentEntity } from '../models/comment.entity';
import { AccountEntity } from '../../../account/models/account.entity';

@ObjectType()
export class CommentEdges {
  @Field(() => [CommentEntity], { nullable: true })
  node?: CommentEntity[];
}

@ObjectType()
export class CommentsDto {
  @Field(() => Int)
  totalCount: number;
  @Field(() => CommentEdges)
  edges: CommentEdges;
  @Field(() => PageInfo)
  pageInfo: PageInfo;
}

@ObjectType()
export class CommentOwnerDto extends PickType(AccountEntity, [
  'image_url',
  'nick_name',
  'custom_url',
] as const) {}

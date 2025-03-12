import {
  Resolver,
  Args,
  Mutation,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { AuthGuard, CurrentUser, UserGuard } from '../../auth/auth.guard';
import { CommentEntity } from './models/comment.entity';
import { IUser } from '../../auth/interfaces/user.interface';
import {
  AddItemCommentParams,
  RemoveItemCommentParams,
} from './interfaces/comment.input';
import { CommentOwnerDto } from './interfaces/comment.dto';

@Resolver(() => CommentEntity)
export class CommentAuthResolver {
  constructor(private readonly commentService: CommentService) {}

  @Mutation(() => CommentEntity, {
    description: 'Add comment to token',
  })
  @UseGuards(AuthGuard)
  addItemComment(
    @CurrentUser() owner: IUser,
    @Args('params') params: AddItemCommentParams,
  ): Promise<CommentEntity> {
    return this.commentService.addComment(owner.sub, params);
  }

  @Mutation(() => Boolean, {
    description: 'Remove comment from token',
  })
  @UseGuards(AuthGuard)
  removeItemComment(
    @CurrentUser() owner: IUser,
    @Args('params') params: RemoveItemCommentParams,
  ): Promise<boolean> {
    return this.commentService.removeComment(owner.sub, params);
  }

  @Mutation(() => Boolean, {
    description: 'Like/unlike a comment',
  })
  @UseGuards(AuthGuard)
  commentLike(
    @CurrentUser() { sub }: IUser,
    @Args('comment_id', { type: () => Int }) comment_id: number,
  ): Promise<boolean> {
    return this.commentService.changeLike(comment_id, sub);
  }

  @ResolveField(() => Boolean, { name: 'is_my_like', defaultValue: false })
  @UseGuards(UserGuard)
  isMyLike(@Parent() comment: CommentEntity, @CurrentUser() user?: IUser) {
    if (!user?.sub) return false;
    return this.commentService.isLike(user.sub, +comment.id);
  }

  @ResolveField(() => CommentOwnerDto)
  owner(@Parent() comment: CommentEntity): Promise<CommentOwnerDto> {
    return this.commentService.getCommentOwner(comment.user_id);
  }
}

import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BlogEntity } from './models/blog.entity';
import { BlogService } from './blog.service';
import {
  CreateBlogParams,
  DeleteBlogParams,
  GetLastMediumBlogParams,
  UpdateBlogParams,
} from './blog.interface';
import { UseGuards } from '@nestjs/common';
import { AuthGuard, CurrentUser } from '../auth/auth.guard';
import { IUser } from '../auth/interfaces/user.interface';

@Resolver(() => BlogEntity)
export class BlogResolver {
  constructor(private blogService: BlogService) {}

  @Mutation(() => BlogEntity)
  @UseGuards(AuthGuard)
  createBlog(@Args('params') params: CreateBlogParams) {
    return this.blogService.create(params);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  deleteBlog(@Args('params') params: DeleteBlogParams) {
    return this.blogService.delete(params);
  }

  @Mutation(() => BlogEntity)
  @UseGuards(AuthGuard)
  updateBlog(
    @CurrentUser() { sub }: IUser,
    @Args('params') params: UpdateBlogParams,
  ) {
    return this.blogService.update(sub, params);
  }

  @Query(() => BlogEntity, { nullable: true })
  getLastMediumBlog(@Args('params') params: GetLastMediumBlogParams) {
    return this.blogService.getLastMediumBlog(params);
  }
}

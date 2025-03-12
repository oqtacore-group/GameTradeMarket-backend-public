import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ReviewEntity } from './models/review.entity';
import { ReviewService } from './review.service';
import {
  CreateReviewParams,
  DeleteReviewParams,
  UpdateReviewParams,
} from './review.interface';
import { UseGuards } from '@nestjs/common';
import { AuthGuard, CurrentUser } from '../auth/auth.guard';
import { IUser } from '../auth/interfaces/user.interface';
import { ReviewOwnerDto } from './dto/review.dto';

@Resolver(() => ReviewEntity)
export class ReviewResolver {
  constructor(private reviewService: ReviewService) {}

  @Mutation(() => ReviewEntity)
  @UseGuards(AuthGuard)
  createReview(@Args('params') params: CreateReviewParams) {
    return this.reviewService.create(params);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  deleteReview(@Args('params') params: DeleteReviewParams) {
    return this.reviewService.delete(params);
  }

  @Mutation(() => ReviewEntity)
  @UseGuards(AuthGuard)
  updateReview(
    @CurrentUser() { sub }: IUser,
    @Args('params') params: UpdateReviewParams,
  ) {
    return this.reviewService.update(sub, params);
  }

  @ResolveField(() => ReviewOwnerDto)
  author(@Parent() review: ReviewEntity): Promise<ReviewOwnerDto> {
    return this.reviewService.getOwner(review.user_id);
  }
}

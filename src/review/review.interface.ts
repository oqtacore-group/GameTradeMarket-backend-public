import { Field, InputType, Int, OmitType, PickType } from '@nestjs/graphql';
import { ReviewEntity } from './models/review.entity';
import { IsInt, IsNotEmpty, IsString, IsUUID, Max, Min } from 'class-validator';

@InputType()
export class CreateReviewParams extends OmitType(ReviewEntity, [
  'id',
  'create_time',
]) {
  @IsUUID(4)
  @Field(() => String)
  user_id: string;

  @IsString()
  @Field(() => String)
  game_code: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  description: string;

  @IsInt()
  @Max(5)
  @Min(1)
  @Field(() => Int)
  rating: number;
}

@InputType()
export class UpdateReviewParams extends OmitType(ReviewEntity, [
  'user_id',
  'create_time',
]) {
  @IsInt()
  @Field(() => Int)
  id: number;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  description: string;

  @IsInt()
  @Max(5)
  @Min(1)
  @Field(() => Int)
  rating: number;
}

@InputType()
export class DeleteReviewParams extends PickType(ReviewEntity, ['id']) {
  @IsInt()
  @Field(() => Int)
  id: number;
}

@InputType()
export class GetAllReviewParams {
  @Field(() => String, { nullable: true })
  gameCode?: string;
}

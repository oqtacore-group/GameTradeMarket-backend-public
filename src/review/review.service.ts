import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewEntity } from './models/review.entity';
import {
  CreateReviewParams,
  DeleteReviewParams,
  GetAllReviewParams,
  UpdateReviewParams,
} from './review.interface';
import { CommentOwnerDto } from '../inventory/comments/interfaces/comment.dto';
import { AccountEntity } from '../account/models/account.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(ReviewEntity)
    private readonly reviewRepository: Repository<ReviewEntity>,
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
  ) {}

  async getReviewCountBySource(code: string): Promise<number> {
    return this.reviewRepository.count({
      where: {
        game_code: code,
      },
    });
  }

  async getRatingBySource(code: string): Promise<number> {
    const AVG_RATING_DEFAULT = 4;
    const reviews = await this.reviewRepository.find({
      where: { game_code: code },
    });
    const rating_sum = reviews
      .map((review) => review.rating)
      .reduce((v, a) => v + a, 0);

    return reviews && reviews.length
      ? Math.round((rating_sum / reviews.length) * 10) / 10
      : AVG_RATING_DEFAULT;
  }

  async create(params: CreateReviewParams): Promise<ReviewEntity> {
    const review = await this.reviewRepository.save(params);
    return this.reviewRepository.findOne({ where: { id: review.id } });
  }

  async delete(params: DeleteReviewParams): Promise<boolean> {
    const { id } = params;
    const deleteResult = await this.reviewRepository.delete(id);
    return deleteResult.affected > 0;
  }

  async getAll(
    params: GetAllReviewParams,
    byGame = false,
  ): Promise<ReviewEntity[]> {
    const where = {};
    if (params.gameCode) {
      where['game_code'] = params.gameCode;
    } else if (byGame) {
      return [];
    }
    return this.reviewRepository.find({
      where,
      order: { create_time: 'DESC' },
    });
  }

  async update(
    user_id: string,
    params: UpdateReviewParams,
  ): Promise<ReviewEntity> {
    const review = await this.reviewRepository.findOne({
      where: { id: params.id },
    });
    if (!review) {
      throw new NotFoundException('review not found');
    }
    if (review.user_id !== user_id) {
      throw new ForbiddenException('access denied');
    }
    await this.reviewRepository.save(params);
    return this.reviewRepository.findOne({
      where: { id: params.id },
    });
  }

  async getOwner(user_id: string): Promise<CommentOwnerDto> {
    return this.accountRepository.findOne({
      select: ['id', 'image_url', 'nick_name', 'custom_url'],
      where: { id: user_id },
    });
  }
}

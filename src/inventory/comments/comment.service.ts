import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEntity } from './models/comment.entity';
import { Repository } from 'typeorm';
import {
  AddItemCommentParams,
  RemoveItemCommentParams,
} from './interfaces/comment.input';
import { CommentLikeEntity } from './models/comment-like.entity';
import { CommentOwnerDto, CommentsDto } from './interfaces/comment.dto';
import { PaginationParams } from '../../utils/interfaces/utils.interface';
import { AccountEntity } from '../../account/models/account.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    @InjectRepository(CommentLikeEntity)
    private readonly commentLikeRepository: Repository<CommentLikeEntity>,
  ) {}

  async getCommentsByItemId(
    item_id: number,
    params: PaginationParams,
  ): Promise<CommentsDto> {
    const [node, totalCount] = await this.commentRepository.findAndCount({
      where: { item_id },
      order: { id: 'DESC' },
      skip: params.offset,
      take: params.first,
    });
    return {
      totalCount,
      edges: {
        node,
      },
      pageInfo: {
        hasNextPage: params?.offset + params?.first < totalCount,
      },
    };
  }

  async getCommentOwner(id: string): Promise<CommentOwnerDto> {
    return this.accountRepository.findOne({
      select: ['image_url', 'nick_name', 'custom_url'],
      where: { id },
    });
  }

  async addComment(
    user_id: string,
    params: AddItemCommentParams,
  ): Promise<CommentEntity> {
    const comment = this.commentRepository.create({ user_id, ...params });
    await this.commentRepository.save(comment);

    return comment;
  }

  async removeComment(
    user_id: string,
    params: RemoveItemCommentParams,
  ): Promise<boolean> {
    try {
      await this.commentRepository.delete({ user_id, id: params.comment_id });
      return true;
    } catch {
      return false;
    }
  }

  async isLike(user_id: string, comment_id: number): Promise<boolean> {
    const like = await this.commentLikeRepository.findOne({
      where: { comment_id, user_id },
    });
    return !!like;
  }

  async changeLike(comment_id: number, user_id: string): Promise<boolean> {
    try {
      const like = await this.commentLikeRepository.findOne({
        where: {
          comment_id,
          user_id,
        },
      });
      if (like) {
        await this.commentLikeRepository.delete(like.id);
      } else {
        await this.commentLikeRepository.insert({ comment_id, user_id });
      }
      return true;
    } catch {
      return false;
    }
  }
}

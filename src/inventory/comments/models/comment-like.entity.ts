import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, Int, ID, ObjectType } from '@nestjs/graphql';
import { AccountEntity } from '../../../account/models/account.entity';
import { CommentEntity } from './comment.entity';

@ObjectType('InventoryCommentLike')
@Entity({ schema: 'inventory', name: 'item_comment_likes' })
@Index(['comment_id', 'user_id'], { unique: true })
export class CommentLikeEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column('integer')
  comment_id: number;

  @Field(() => String)
  @Column('uuid')
  user_id: string;

  @ManyToOne(() => CommentEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'comment_id',
    referencedColumnName: 'id',
  })
  comment: CommentEntity;

  @ManyToOne(() => AccountEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: AccountEntity;
}

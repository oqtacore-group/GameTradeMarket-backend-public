import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, HideField, ID, Int, ObjectType } from '@nestjs/graphql';
import { AccountEntity } from '../../../account/models/account.entity';
import { InventoryEntity } from '../../models/inventory.entity';
import { CommentLikeEntity } from './comment-like.entity';

@ObjectType('InventoryComment')
@Entity({ schema: 'inventory', name: 'item_comments' })
export class CommentEntity extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column('text')
  message: string;

  @Field(() => Int)
  @Column('integer')
  item_id: number;

  @Field(() => String)
  @Column('uuid')
  user_id: string;

  @Field(() => Date)
  @CreateDateColumn()
  create_time: Date;

  @HideField()
  @ManyToOne(() => InventoryEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'item_id',
    referencedColumnName: 'id',
  })
  item: InventoryEntity;

  @HideField()
  @ManyToOne(() => AccountEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: AccountEntity;

  @HideField()
  @OneToMany(() => CommentLikeEntity, (l) => l.comment)
  likes: CommentLikeEntity[];
}

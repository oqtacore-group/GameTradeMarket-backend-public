import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, Int, ID, ObjectType } from '@nestjs/graphql';
import { AccountEntity } from '../../account/models/account.entity';
import { InventoryEntity } from './inventory.entity';

@ObjectType('InventoryLike')
@Entity({ schema: 'inventory', name: 'item_likes' })
@Index(['item_id', 'user_id'], { unique: true })
export class InventoryLikeEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column('integer')
  item_id: number;

  @Field(() => String)
  @Column('uuid')
  user_id: string;

  @ManyToOne(() => InventoryEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'item_id',
    referencedColumnName: 'id',
  })
  item: InventoryEntity;

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

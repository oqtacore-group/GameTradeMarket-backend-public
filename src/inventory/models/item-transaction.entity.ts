import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Field, ObjectType, Float, Int, ID } from '@nestjs/graphql';
import { AccountEntity } from '../../account/models/account.entity';
import { InventoryEntity } from './inventory.entity';

@ObjectType('ItemTransaction')
@Entity({ schema: 'inventory', name: 'item_transactions' })
export class ItemTransactionEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column('integer')
  item_id: number;

  @Field(() => String)
  @Column('uuid')
  seller_uid: string;

  @Field(() => String)
  @Column('uuid')
  buyer_uid: string;

  @Field(() => Float)
  @Column('real')
  price: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at?: Date;

  @ManyToOne(() => AccountEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'seller_uid',
    referencedColumnName: 'id',
  })
  seller: AccountEntity;

  @ManyToOne(() => AccountEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'buyer_uid',
    referencedColumnName: 'id',
  })
  buyer: AccountEntity;

  @ManyToOne(() => InventoryEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'item_id',
    referencedColumnName: 'id',
  })
  token: InventoryEntity;
}

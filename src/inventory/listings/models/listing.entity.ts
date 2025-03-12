import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Field, ObjectType, HideField, Float, Int } from '@nestjs/graphql';
import { InventoryEntity } from '../../models/inventory.entity';

@ObjectType('Listing')
@Entity({ schema: 'inventory', name: 'listings' })
export class ListingEntity {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column('integer')
  item_id: number;

  @Field(() => String)
  @Column('uuid', { nullable: true })
  user_id: string;

  @Field(() => String)
  @Column('varchar')
  wallet: string;

  @Field(() => Float)
  @Column('numeric', { nullable: true })
  price_prev: number;

  @Field(() => Float)
  @Column('numeric')
  price_current: number;

  @Field(() => Boolean)
  @Column('boolean', { default: false })
  is_listing: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  create_time?: Date;

  @HideField()
  @ManyToOne(() => InventoryEntity)
  @JoinColumn({ name: 'item_id', referencedColumnName: 'id' })
  itemId?: InventoryEntity;
}

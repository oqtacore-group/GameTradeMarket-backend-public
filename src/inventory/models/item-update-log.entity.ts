import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  BaseEntity,
} from 'typeorm';
import { Field, Int, ID } from '@nestjs/graphql';

@Entity({ schema: 'inventory', name: 'item_update_log' })
export class ItemUpdateLogEntity extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column('integer')
  item_id: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at?: Date;

  @Field(() => String)
  @Column('varchar')
  game_code: string;

  @Field(() => String)
  @Column('varchar')
  action: string;

  @Field(() => String)
  @Column('text')
  token_value?: string;

  @Field(() => String)
  @Column('text')
  contract?: string;

  @Field(() => Number)
  @Column('numeric')
  price?: number;

  @Field(() => String)
  @Column('varchar')
  user_id: string;
}

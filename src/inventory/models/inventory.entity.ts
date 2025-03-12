import {
  ObjectType,
  Field,
  Float,
  registerEnumType,
  HideField,
  Int,
} from '@nestjs/graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  UpdateDateColumn,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';

import { ContractEntity } from './contract.entity';
import { AccountEntity } from '../../account/models/account.entity';
import { ListingEntity } from '../listings/models/listing.entity';
import { TokenDataAttrs } from '../../blockchain/dto/token-info.dto';
import { Blockchain } from '../../blockchain/interfaces/blockchain.interface';
import { WalletEntity } from '../../account/wallet/models/wallet.entity';
import { InventoryLikeEntity } from './inventory-like.entity';
import { CommentEntity } from '../comments/models/comment.entity';
import { ItemData } from '../interfaces/card.interface';

export enum SaleType {
  FIXED_PRICE = 'FIXED_PRICE',
  NOT_FOR_SALE = 'NOT_FOR_SALE',
}

registerEnumType(SaleType, { name: 'SaleType' });

@ObjectType('Item')
@Entity({ schema: 'inventory', name: 'items' })
@Index(['token_value', 'contract'], { unique: true })
export class InventoryEntity extends BaseEntity {
  @HideField()
  @PrimaryGeneratedColumn()
  id?: number;

  @Field(() => String)
  @Column('text')
  token_value?: string;

  @Field(() => String)
  @Column('text')
  contract?: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  trade_contract?: string;

  @Field(() => String)
  @Column('varchar')
  wallet?: string;

  @Field(() => String, { nullable: true })
  @Column('text')
  token_uri?: string;

  @Field(() => Float, { nullable: true })
  @Column('numeric', { nullable: true })
  price?: number;

  @Field(() => TokenDataAttrs, { defaultValue: {} })
  @Column('jsonb', { default: {} })
  attributes?: TokenDataAttrs;

  @Column('varchar', { nullable: true })
  picture_url?: string;

  @Field(() => String)
  @Column('varchar', { default: '0x0000000000000000000000000000000000000000' })
  coin_address: string;

  @Field(() => Float, { nullable: true })
  @Column('real', { nullable: true })
  coin_price: number;

  @Field(() => SaleType, { defaultValue: SaleType.FIXED_PRICE })
  @Column('text')
  sale_type?: SaleType;

  @Field(() => Float, { nullable: true })
  @Column('numeric', { nullable: true })
  fee?: number;

  @Field(() => Boolean)
  @Column('boolean', { default: false })
  need_update?: boolean = false;

  @Field(() => Boolean)
  @Column('boolean', { default: false })
  approved?: boolean = false;

  @Field(() => String)
  @Column('varchar')
  blockchain?: Blockchain;

  @Column('varchar', { nullable: true })
  platform: string;

  @Column('integer', { nullable: true })
  imxOrderId: number;

  @Field(() => String)
  @Column('varchar')
  game_code?: string;

  @HideField()
  @CreateDateColumn({ type: 'timestamptz' })
  create_time?: Date;

  @HideField()
  @UpdateDateColumn({ type: 'timestamptz' })
  update_time?: Date;

  @Field(() => String)
  currency?: string;

  @Field(() => String)
  game_name?: string;

  @Field(() => String)
  picture?: string;

  @Field(() => AccountEntity)
  user?: AccountEntity;

  @Field(() => Int)
  likes_count: number;

  @Column('jsonb')
  item_data?: ItemData;

  @HideField()
  floor_price?: number;

  @HideField()
  @ManyToOne(() => ContractEntity)
  @JoinColumn({ name: 'contract', referencedColumnName: 'contract' })
  contractData?: ContractEntity;

  @HideField()
  @ManyToOne(() => WalletEntity, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'wallet', referencedColumnName: 'address' })
  walletData?: WalletEntity;

  @OneToMany(() => ListingEntity, (l) => l.itemId)
  itemIds: ListingEntity[];

  @OneToMany(() => InventoryLikeEntity, (l) => l.item)
  likes: InventoryLikeEntity[];

  @OneToMany(() => CommentEntity, (c) => c.item)
  comments: CommentEntity[];
}

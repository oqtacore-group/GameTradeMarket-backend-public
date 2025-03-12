import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, HideField, ObjectType } from '@nestjs/graphql';
import { AccountEntity } from '../../models/account.entity';

@ObjectType('FriendDto')
@Entity({ schema: 'account', name: 'friends' })
@Index(['owner', 'friend'], { unique: true })
export class FriendEntity extends BaseEntity {
  @HideField()
  @PrimaryGeneratedColumn()
  id: number;
  @Field(() => String)
  @Column('uuid')
  owner: string;
  @Field(() => String)
  @Column('uuid')
  friend: string;
  @Field(() => Date)
  @CreateDateColumn()
  create_time: Date;

  @ManyToOne(() => AccountEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'owner',
    referencedColumnName: 'id',
  })
  userOwner: AccountEntity;

  @ManyToOne(() => AccountEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'friend',
    referencedColumnName: 'id',
  })
  userFriend: AccountEntity;
}

@Entity({ schema: 'account', name: 'friend_requests' })
export class FriendRequestEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column('uuid')
  recipient: string;
  @Column('uuid')
  sender: string;
  @CreateDateColumn()
  create_time: Date;

  @ManyToOne(() => AccountEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'sender',
    referencedColumnName: 'id',
  })
  userSender: AccountEntity;

  @ManyToOne(() => AccountEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'recipient',
    referencedColumnName: 'id',
  })
  userRecipient: AccountEntity;
}

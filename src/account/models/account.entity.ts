import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WalletEntity } from '../wallet/models/wallet.entity';
import { UserRoleEntity } from '../../role/models/user-role.entity';
import {
  Field,
  Float,
  HideField,
  ID,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IAccountUser, UserSocial } from '../account.interface';
import { TokenTransfer } from '../../inventory/interfaces/token-transfer.interface';
import { UserConnection } from '../dto/user.dto';
import { AccessResource } from '../../role/resource/dto/resource.dto';
import { Wallet } from '../wallet/dto/wallet.dto';
import { UserRole } from '../../role/dto/user-role.dto';
import { FriendEntity } from '../friend/models/friend.entity';
import { UserAchievementEntity } from './user-achievement.entity';

export enum SocialKind {
  DISCORD = 'discord',
  TWITTER = 'twitter',
  WEB = 'web',
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  YOUTUBE = 'youtube',
  REDDIT = 'reddit',
  TIKTOK = 'tiktok',
  TELEGRAM = 'telegram',
  MEDIUM = 'medium',
  GITHUB = 'github',
}

registerEnumType(SocialKind, { name: 'SocialKind' });

@ObjectType('User')
@Entity({ schema: 'account', name: 'users' })
export class AccountEntity extends BaseEntity implements IAccountUser {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  bio: string;

  @HideField()
  @CreateDateColumn({ type: 'timestamptz' })
  create_time: Date;

  @Field(() => String, { nullable: true })
  @Column('text', { unique: true, nullable: true })
  custom_url: string;

  @Field(() => String)
  @Column({ length: 64, unique: true })
  email: string;

  @HideField()
  @Column({ default: false })
  email_verified: boolean;

  @HideField()
  @Column('text', { unique: true, nullable: true })
  google_sub: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  image_url: string;

  @Field(() => Date, { nullable: true })
  @Column('timestamptz', { nullable: true })
  last_visited: Date;

  @Field(() => String, { nullable: true, defaultValue: 'en' })
  @Column('char', { length: 2, default: 'en' })
  locale: string;

  @HideField()
  @Column('int', { nullable: true })
  mail_code: number;

  @HideField()
  @Column('int', { default: 0 })
  mail_code_tries: number;

  @Field(() => String)
  @Column({ length: 32, nullable: true })
  nick_name: string;

  @HideField()
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  online_time: Date;

  @HideField()
  @Column({ length: 60, nullable: true })
  password: string;

  @HideField()
  @Column('int', { nullable: true })
  password_code: number;

  @Field(() => String)
  @Column('varchar', { nullable: true })
  referrerLink?: string;

  @Field(() => String)
  @Column('varchar', { nullable: true })
  invitedBy?: string;

  @Field(() => String)
  @Column('varchar', { nullable: true, unique: true })
  promoCode?: string;

  @HideField()
  @Column({ default: 0 }) // TODO not used
  password_code_tries: number;

  @Field(() => [UserSocial])
  @Column('jsonb', { default: [], nullable: true })
  social?: Record<string, UserSocial>[];

  @HideField()
  @UpdateDateColumn({ type: 'timestamptz' })
  update_time: Date;

  @Column('uuid')
  @Generated('uuid')
  version: string;

  @Field(() => Float, { defaultValue: 0 })
  @Column('numeric', { default: 0 })
  bonuses = 0;

  @Field(() => [TokenTransfer], { nullable: true })
  searchItems?: TokenTransfer[];

  @Field(() => [UserRole], { nullable: true })
  @OneToMany(() => UserRoleEntity, (r) => r.user)
  roles?: UserRole[];

  @Field(() => [Wallet], { nullable: true })
  @OneToMany(() => WalletEntity, (wt) => wt.user)
  wallets?: Wallet[];

  @Field(() => [AccessResource], { nullable: true })
  accessProfiles?: AccessResource[];

  @Field(() => UserConnection, { nullable: true })
  friendRequests?: UserConnection;

  @Field(() => UserConnection, { nullable: true })
  @OneToMany(() => FriendEntity, (wt) => wt.userFriend)
  friends?: FriendEntity[];

  @Field(() => Number, { defaultValue: 0 })
  unreadCount?: number;

  @Field(() => String)
  last_message?: string;

  @Field(() => String)
  @Column('varchar', { nullable: true })
  player_token?: string;

  message_create_time?: Date;

  @HideField()
  @OneToMany(() => UserAchievementEntity, (r) => r.user)
  achievements?: UserAchievementEntity[];
}

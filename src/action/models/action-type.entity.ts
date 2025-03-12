import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  Timestamp,
} from 'typeorm';
import { Field, Float, HideField, ID, Int, ObjectType } from '@nestjs/graphql';
import { UserConnection } from '../../account/dto/user.dto';
import { FriendEntity } from '../../account/friend/models/friend.entity';
import { UserActionEntity } from './user-action.entity';

@ObjectType()
@Entity({
  schema: 'inventory',
  name: 'actions_types',
})
export class ActionTypeEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column('varchar', { unique: true })
  name: string;

  @Field(() => Int, { defaultValue: 1 })
  @Column('int', { default: 1 })
  limit = 1;

  @Field(() => Int, { defaultValue: 1 })
  @Column('int', { default: 1 })
  amount = 1;

  @Field(() => Boolean, { defaultValue: false, name: 'isPublic' })
  @Column('boolean', { default: false })
  is_public = false;

  @Field(() => Boolean, { defaultValue: false, name: 'isRequired' })
  @Column('boolean', { default: false })
  is_required = false;

  @Field(() => Boolean, { defaultValue: false, name: 'isInfinity' })
  @Column('boolean', { default: false })
  is_infinity = false;

  @Field(() => String, { name: 'createdAt' })
  @CreateDateColumn()
  created_at: Timestamp;

  @HideField()
  @OneToMany(() => UserActionEntity, (ua) => ua.action)
  @JoinColumn({
    name: 'id',
    referencedColumnName: 'action_id',
  })
  userActions?: UserActionEntity[];
}

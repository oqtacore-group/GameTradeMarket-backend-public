import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { AccountEntity } from './account.entity';

@ObjectType('AccessKey')
@Entity({ schema: 'admin', name: 'api_keys' })
export class AccessEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field(() => String)
  @Column('varchar', { unique: true })
  api_key: string;

  @Field(() => String)
  @Column('uuid')
  user_id: string;

  @CreateDateColumn()
  create_time: Date;

  @Field(() => String)
  @Column('varchar')
  env: string;

  @Field(() => Date, { nullable: true })
  @Column('timestamp')
  expires?: Date;

  @Field(() => Date, { nullable: true })
  @Column('timestamp')
  last_activity?: Date;

  @Field(() => Boolean, { defaultValue: false })
  @Column('boolean')
  is_active: boolean;

  @ManyToOne(() => AccountEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: AccountEntity;
}

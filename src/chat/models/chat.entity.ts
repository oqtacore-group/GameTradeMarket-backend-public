import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, HideField, ID } from '@nestjs/graphql';
import { AccountEntity } from '../../account/models/account.entity';
import { FileMetaData } from '../chat.interface';

@Entity({ schema: 'account', name: 'user_messages' })
export class ChatEntity extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;
  @Field(() => String)
  @Column('uuid')
  sender_id: string;
  @Field(() => String)
  @Column('uuid')
  recipient_id: string;
  @Field(() => String)
  @Column('text')
  context: string;
  @Field(() => Boolean)
  @Column('boolean', { default: false })
  is_media: boolean;
  @HideField()
  @Column('boolean', { default: false })
  is_read: boolean;
  @Field(() => FileMetaData)
  @Column('jsonb', {
    default: {
      key: '',
      bucket: '',
      etag: '',
    } as FileMetaData,
  })
  meta_data: Record<string, FileMetaData>;
  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  create_time: Date;

  @Field(() => AccountEntity, { nullable: true })
  @ManyToOne(() => AccountEntity, {
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'sender_id',
    referencedColumnName: 'id',
  })
  sender: AccountEntity;

  @Field(() => AccountEntity, { nullable: true })
  @ManyToOne(() => AccountEntity, {
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'recipient_id',
    referencedColumnName: 'id',
  })
  recipient: AccountEntity;
}

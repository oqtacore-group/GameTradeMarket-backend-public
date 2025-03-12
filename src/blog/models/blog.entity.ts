import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AccountEntity } from '../../account/models/account.entity';
import { Field, HideField, ID, InputType, ObjectType } from '@nestjs/graphql';
import { SourceEntity } from '../../source/models/source.entity';
import { ApiProperty } from '@nestjs/swagger';

@ObjectType('BlogDto')
@InputType({ isAbstract: true })
@Entity({ schema: 'inventory', name: 'blogs' })
export class BlogEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Id', required: true })
  id: number;

  @Field(() => String)
  @Column('uuid')
  @ApiProperty({ description: 'User id', required: true })
  user_id: string;

  @Field(() => String)
  @Column('varchar')
  @ApiProperty({ description: 'Game code', required: true })
  game_code: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  @ApiProperty({ description: 'External URL', required: true })
  external_url?: string;

  @Field(() => String)
  @Column('varchar', { length: 4000 })
  @ApiProperty({ description: 'Description', required: true })
  description: string;

  @Field(() => String)
  @Column('varchar')
  @ApiProperty({ description: 'Title', required: true })
  title: string;

  @Field(() => String, { nullable: true })
  @Column('varchar', { nullable: true })
  @ApiProperty({ description: 'Subtitle', required: true })
  sub_title?: string;

  @Field(() => String)
  @Column('text')
  img_url: string;

  @Field(() => Boolean)
  @Column('boolean')
  @ApiProperty({ description: 'Published', required: true })
  is_published: boolean;

  @Field(() => String)
  @CreateDateColumn({ type: 'timestamp' })
  @ApiProperty({ description: 'Create time', required: true })
  create_time: Date;

  @HideField()
  @ManyToOne(() => AccountEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: AccountEntity;

  @HideField()
  @ManyToOne(() => SourceEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'game_code',
    referencedColumnName: 'code',
  })
  source: SourceEntity;
}

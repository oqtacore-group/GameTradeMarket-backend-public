import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AccountEntity } from '../../account/models/account.entity';
import {
  Field,
  HideField,
  ID,
  InputType,
  Int,
  ObjectType,
} from '@nestjs/graphql';
import { SourceEntity } from '../../source/models/source.entity';

@ObjectType('ReviewDto')
@InputType({ isAbstract: true })
@Entity({ schema: 'inventory', name: 'reviews' })
export class ReviewEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column('uuid')
  user_id: string;

  @Field(() => String)
  @Column('varchar')
  game_code: string;

  @Field(() => String)
  @Column('varchar', { length: 4000 })
  description: string;

  @Field(() => Int)
  @Column('int')
  rating: number;

  @Field(() => String)
  @CreateDateColumn({ type: 'timestamp' })
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

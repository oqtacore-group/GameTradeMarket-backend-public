import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { SourceEntity } from '../../source/models/source.entity';

@ObjectType('AccessKey')
@Entity({ schema: 'admin', name: 'access_keys_games' })
export class AccessKeysGamesEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field(() => String)
  @Column('varchar', { unique: true })
  api_key: string;

  @Field(() => String)
  @Column('varchar')
  game_code: string;

  @ManyToOne(() => SourceEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'game_code',
    referencedColumnName: 'code',
  })
  game: SourceEntity;
}

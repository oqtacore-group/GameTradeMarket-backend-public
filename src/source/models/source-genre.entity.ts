import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { GenreEntity } from '../../genre/models/genre.entity';
import { SourceEntity } from './source.entity';
import { Field, HideField, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity({ schema: 'inventory', name: 'source_genres' })
@Unique(['game_code', 'genre_code'])
export class SourceGenreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column('varchar')
  game_code: string;

  @Field(() => String)
  @Column('varchar')
  genre_code: string;

  @HideField()
  @ManyToOne(() => SourceEntity)
  @JoinColumn({ name: 'game_code', referencedColumnName: 'code' })
  source?: SourceEntity;

  @HideField()
  @ManyToOne(() => GenreEntity)
  @JoinColumn({ name: 'genre_code', referencedColumnName: 'code' })
  genre?: GenreEntity;
}

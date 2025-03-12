import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity({ schema: 'inventory', name: 'genres' })
export class GenreEntity {
  @Field(() => String)
  @PrimaryColumn('varchar')
  code: string;

  @Field(() => String)
  @Column('varchar', { unique: true })
  name: string;
}

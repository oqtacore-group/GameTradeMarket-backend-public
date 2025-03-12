import { ObjectType, Field, HideField } from '@nestjs/graphql';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { SlideMeta } from '../interfaces/slide-meta.interface';

@ObjectType()
@Entity({ schema: 'inventory', name: 'slides' })
export class SlideEntity extends BaseEntity {
  @HideField()
  @PrimaryGeneratedColumn()
  id?: number;

  @Field(() => String)
  @Column('varchar')
  image_url: string;

  @Field(() => String)
  @Column('varchar')
  title: string;

  @Field(() => String, { nullable: true })
  @Column('varchar', { nullable: true })
  subtitle?: string;

  @Field(() => SlideMeta, { nullable: true })
  @Column('jsonb', { nullable: true, default: '{}' })
  meta?: SlideMeta;
}

import {
  Entity,
  Column,
  BaseEntity,
  PrimaryColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('ResourceDto')
@Entity({ schema: 'roles', name: 'resources' })
export class ResourceEntity extends BaseEntity {
  @Field(() => ID, {
    description: 'Unique identifier',
  })
  @PrimaryColumn('ltree')
  code: string;
  @Field(() => String, {
    description: 'Resource name',
  })
  @Column({ type: 'varchar', length: 128 })
  name: string;
  @Field(() => Date, { description: 'Creation date' })
  @CreateDateColumn({ type: 'timestamptz' })
  create_time: Date;
  @Field(() => Date, { description: 'Update date' })
  @UpdateDateColumn({ type: 'timestamptz' })
  update_time: Date;
}

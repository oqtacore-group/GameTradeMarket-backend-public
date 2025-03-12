import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ObjectType } from '@nestjs/graphql';
import { AccountEntity } from '../../account/models/account.entity';
import { SourceEntity } from './source.entity';

@ObjectType('SourceUser')
@Entity({ schema: 'inventory', name: 'source_users' })
@Index(['code', 'user_id'], { unique: true })
export class SourceUserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column('varchar')
  code: string;
  @Column('uuid')
  user_id: string;

  @ManyToOne(() => AccountEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: AccountEntity;

  @ManyToOne(() => SourceEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'code',
    referencedColumnName: 'code',
  })
  source: SourceEntity;
}

import {
  Entity,
  Column,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { ObjectType } from '@nestjs/graphql';
import { AccountEntity } from '../../account/models/account.entity';
import { SourceEntity } from './source.entity';

@ObjectType('SourceUserActive')
@Entity({ schema: 'inventory', name: 'source_user_active' })
export class SourceUserActiveEntity extends BaseEntity {
  @PrimaryColumn('varchar')
  game_code: string;

  @PrimaryColumn('uuid')
  user_id: string;

  @Column('integer')
  duration: number;

  @Column('date', { default: 'now()' })
  session_at: Date;

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
    name: 'game_code',
    referencedColumnName: 'code',
  })
  source: SourceEntity;
}

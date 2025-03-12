import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Timestamp,
} from 'typeorm';
import { ActionTypeEntity } from './action-type.entity';

@Entity({
  schema: 'account',
  name: 'user_actions',
})
export class UserActionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  action_id: number;

  @Column('uuid')
  user_id: string;

  @Column('jsonb', { nullable: true })
  extra: Record<any, string>;

  @CreateDateColumn()
  created_at: Timestamp;

  @ManyToOne(() => ActionTypeEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'action_id',
    referencedColumnName: 'id',
  })
  action: ActionTypeEntity;
}

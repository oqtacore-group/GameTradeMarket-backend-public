import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AccountEntity } from './account.entity';

@Entity({ schema: 'account', name: 'user_sessions' })
export class AccountSessionEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid')
  user_id: string;

  @Column('text')
  token: string;

  @CreateDateColumn({ type: 'timestamptz' })
  create_time: Date;

  @ManyToOne(() => AccountEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: AccountEntity;
}

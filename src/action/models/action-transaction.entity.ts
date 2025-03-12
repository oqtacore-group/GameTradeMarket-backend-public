import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Timestamp,
} from 'typeorm';
import { TxType } from '../types/tx-type.type';

@Entity({
  schema: 'admin',
  name: 'action_transactions',
})
export class ActionTransactionEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column('int')
  action_id: number;

  @Column('uuid')
  user_id: string;

  @Column('varchar')
  type: TxType;

  @Column('numeric')
  amount: number;

  @Column('numeric')
  balance: number;

  @CreateDateColumn()
  created_at?: Timestamp;
}

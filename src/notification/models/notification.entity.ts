import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AccountEntity } from '../../account/models/account.entity';
import { NotificationData } from '../dto/notification.dto';

@Entity({ schema: 'account', name: 'notifications' })
export class NotificationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid')
  user_id: string;

  @Column('varchar')
  title: string;

  @Column('text')
  body: string;

  @Column('varchar')
  type: string;

  @CreateDateColumn({ type: 'timestamp' })
  create_time: Date;

  @ManyToOne(() => AccountEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: AccountEntity;

  @Column({ type: 'jsonb' })
  data: NotificationData;
}

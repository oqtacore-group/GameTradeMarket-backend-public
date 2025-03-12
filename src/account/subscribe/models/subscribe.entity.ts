import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ schema: 'account', name: 'writes' })
export class SubscribeEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column('text')
  email: string;
  @Column('text')
  name: string;
  @Column('text')
  body: string;
  @CreateDateColumn({ type: 'timestamptz' })
  create_time: Date;
}

@Entity({ schema: 'account', name: 'user_subscriptions' })
export class UserSubscribeEntity extends BaseEntity {
  @PrimaryColumn('text')
  email: string;
  @CreateDateColumn({ type: 'timestamptz' })
  create_time: Date;
}

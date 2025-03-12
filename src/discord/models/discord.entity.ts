import {
  Entity,
  Column,
  BaseEntity,
  CreateDateColumn,
  PrimaryColumn,
  Timestamp,
} from 'typeorm';

@Entity({ schema: 'account', name: 'discords' })
export class DiscordEntity extends BaseEntity {
  @PrimaryColumn('integer')
  id: number;

  @Column('varchar', { unique: true })
  nickname: string;

  @CreateDateColumn({ type: 'timestamp' })
  create_time: Timestamp;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AccountEntity } from '../../models/account.entity';
import { registerEnumType } from '@nestjs/graphql';

export enum WalletProvider {
  METAMASK = 'metamask',
  WALLET_CONNECT = 'walletConnect',
}

registerEnumType(WalletProvider, { name: 'WalletProvider' });

@Entity({ schema: 'account', name: 'user_wallets' })
export class WalletEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid')
  user_id: string;

  @Column('text')
  name: string;

  @Column({ unique: true })
  address: string;

  @Column('enum', {
    enum: WalletProvider,
    enumName: 'wallet_provider',
  })
  provider: WalletProvider;

  @CreateDateColumn({ type: 'timestamptz' })
  create_time: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  update_time: Date;

  @ManyToOne(() => AccountEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: AccountEntity;
}

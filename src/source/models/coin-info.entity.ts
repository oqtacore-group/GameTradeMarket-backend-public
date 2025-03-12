import {
  Column,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { NetworkEntity } from '../../blockchain/models/network.entity';

@Entity({ schema: 'inventory', name: 'coin_info' })
export class CoinInfoEntity {
  @Column()
  @Generated()
  id: number;

  @Column('varchar')
  name: string;

  @Column('varchar')
  symbol: string;

  @Column('integer')
  decimals: number;

  @Column('integer')
  price: number;

  @PrimaryColumn('varchar', {primary: true})
  blockchain: string;

  @PrimaryColumn('varchar', {primary: true})
  contract: string;

  @Column('varchar')
  external_id: string;

  @Column('varchar')
  external_platform: string;

  @Column('varchar')
  thumbnail_url: string;

  @Column('timestamptz')
  update_time: Date;

  @ManyToOne(() => NetworkEntity)
  @JoinColumn({
    name: 'blockchain',
    referencedColumnName: 'code',
  })
  network: NetworkEntity;
}

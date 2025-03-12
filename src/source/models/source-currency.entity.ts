import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SourceEntity } from './source.entity';
import { CoinInfoEntity } from './coin-info.entity';

@Entity({ schema: 'inventory', name: 'source_currencies' })
export class SourceCurrencyEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  game_code: string;

  @Column('varchar')
  coin_id: number;

  @ManyToOne(() => SourceEntity)
  @JoinColumn({ name: 'game_code', referencedColumnName: 'code' })
  source?: SourceEntity;

  @ManyToOne(() => CoinInfoEntity)
  @JoinColumn({ name: 'coin_id', referencedColumnName: 'id' })
  coin?: CoinInfoEntity;
}

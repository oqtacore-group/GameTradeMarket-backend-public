import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ContractEntity } from '../../inventory/models/contract.entity';
import { AccountEntity } from '../../account/models/account.entity';
import { SourceStateType } from '../types/source-state.type';
import { AppLink, MediaLink, SocialLink } from '../dto/source.dto';
import { SourceCurrencyEntity } from './source-currency.entity';

@Entity({ schema: 'inventory', name: 'sources' })
export class SourceEntity extends BaseEntity {
  @PrimaryColumn('varchar')
  code: string;
  @Column('text')
  name: string;
  @Column('text')
  publisher: string;
  @Column('text')
  developer: string;
  @Column('uuid')
  owner_id: string;

  @Column('varchar')
  release_date: string;

  @Column('jsonb', { default: [] })
  social_links: SocialLink[];

  @Column('jsonb', { default: [] })
  app_links: AppLink[];

  @Column('jsonb', { default: [] })
  media_links: MediaLink[];

  @Column('text')
  description: string;

  @Column('boolean', { default: false })
  is_verify: boolean;

  @Column('text')
  logo: string;

  @Column('bool', { default: false })
  is_partner: boolean;

  @Column('bool', { default: false })
  is_free_to_play: boolean;

  @Column('text')
  external_link: string;

  @Column('bool', { default: false })
  is_nft_required: boolean;

  @Column('bool', { default: false })
  is_crypto_required: boolean;

  @Column('bool', { default: false })
  is_game_required: boolean;

  @Column('bool', { default: false })
  is_play_to_earn_nft: boolean;

  @Column('bool', { default: false })
  is_play_to_earn_crypto: boolean;

  @Column('bool', { default: false })
  hidden: boolean;

  @Column('text', { nullable: true })
  picture_url?: string;

  @Column('varchar')
  state: SourceStateType;

  @UpdateDateColumn({ type: 'timestamptz' })
  update_time: Date;

  @OneToMany(() => ContractEntity, (c) => c.source)
  contracts?: ContractEntity[];

  @OneToMany(() => SourceCurrencyEntity, (c) => c.source)
  currencies?: SourceCurrencyEntity[];

  @ManyToOne(() => AccountEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'owner_id',
    referencedColumnName: 'id',
  })
  user: AccountEntity;
}

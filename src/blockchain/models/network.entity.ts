import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, Column, BaseEntity, PrimaryColumn } from 'typeorm';
import { Blockchain } from '../interfaces/blockchain.interface';
import { Currency } from '../../inventory/interfaces/card.interface';

@ObjectType()
@Entity({ schema: 'blockchain', name: 'networks' })
export class NetworkEntity extends BaseEntity {
  @Field()
  @PrimaryColumn()
  code: Blockchain;

  @Column('text')
  currency: Currency;

  @Column('boolean', { default: true })
  is_enabled: boolean;

  @Field()
  @Column('text')
  name: string;

  @Column('text')
  rpc_url: string;

  @Column('varchar')
  external_url: string;

  @Column('text', { nullable: true })
  trade_contract: string;
}

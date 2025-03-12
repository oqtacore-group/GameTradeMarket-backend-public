import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NetworkEntity } from '../../blockchain/models/network.entity';
import { SourceEntity } from '../../source/models/source.entity';
import { Field, HideField, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Contract')
@Entity({ schema: 'inventory', name: 'contracts' })
export class ContractEntity extends BaseEntity {
  @Field(() => ID)
  @PrimaryColumn('varchar')
  contract: string;

  @Field(() => ID)
  @PrimaryColumn('text')
  blockchain: string;

  @Field(() => ID)
  @PrimaryColumn('varchar')
  game_code: string;

  @Field(() => String, { defaultValue: {} })
  @Column('jsonb', { default: {} })
  mapping: Record<string, any>;

  @Field(() => Boolean)
  @Column('boolean', { default: false })
  is_test: boolean;

  @HideField()
  @Column('text', { default: 'GAMETRADE' })
  platform: string;

  @HideField()
  @CreateDateColumn({ type: 'timestamptz' })
  create_time: Date;

  @HideField()
  @UpdateDateColumn({ type: 'timestamptz' })
  update_time: Date;

  @HideField()
  @ManyToOne(() => NetworkEntity)
  @JoinColumn({
    name: 'blockchain',
    referencedColumnName: 'code',
  })
  network: NetworkEntity;

  @HideField()
  @ManyToOne(() => SourceEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'game_code',
    referencedColumnName: 'code',
  })
  source: SourceEntity;
}

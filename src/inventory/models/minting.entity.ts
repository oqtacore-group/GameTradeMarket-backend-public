import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';
import { Field, ID } from '@nestjs/graphql';
import { MediaLinks, RoadMapData } from 'src/integration/dto/integration.dto';

@Entity({ schema: 'inventory', name: 'launchpad' })
export class LaunchpadEntity extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  game_code: string;

  @Column('varchar')
  title: string;

  @Column('text')
  description: string;

  @Column('text')
  utility?: string;

  @Column('varchar')
  contract: string;

  @Column('varchar')
  blockchain: string;

  @Column('jsonb')
  media: MediaLinks[];

  @Column('timestamp')
  start_mint: Date;

  @Column('varchar')
  start_price: string;

  @Column('numeric')
  amount_items: number;

  @Column('jsonb')
  roadmap: RoadMapData[];

  @Column('boolean')
  is_hidden: boolean;
}

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { SourceEntity } from './source.entity';
import { PlatformEntity } from './platform.entity';

@Entity({ schema: 'inventory', name: 'source_platforms' })
@Unique(['game_code', 'platform_id'])
export class SourcePlatformEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  game_code: string;

  @Column('integer')
  platform_id: number;

  @ManyToOne(() => SourceEntity)
  @JoinColumn({ name: 'game_code', referencedColumnName: 'code' })
  source?: SourceEntity;

  @ManyToOne(() => PlatformEntity)
  @JoinColumn({ name: 'platform_id', referencedColumnName: 'id' })
  platform?: PlatformEntity;
}

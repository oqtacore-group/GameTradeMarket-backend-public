import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { SourceEntity } from './source.entity';
import { ModeEntity } from './mode.entity';

@Entity({ schema: 'inventory', name: 'source_modes' })
@Unique(['game_code', 'mode_id'])
export class SourceModeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  game_code: string;

  @Column('integer')
  mode_id: number;

  @ManyToOne(() => SourceEntity)
  @JoinColumn({ name: 'game_code', referencedColumnName: 'code' })
  source?: SourceEntity;

  @ManyToOne(() => ModeEntity)
  @JoinColumn({ name: 'mode_id', referencedColumnName: 'id' })
  mode?: ModeEntity;
}

import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { SourceEntity } from '../../source/models/source.entity';
import { AchievementEntity } from '../../achievement/models/achievement.entity';
import { AccountEntity } from './account.entity';

@Entity({ schema: 'account', name: 'user_achievements' })
@Unique(['user_id', 'achievement_id'])
export class UserAchievementEntity extends BaseEntity {
  @PrimaryColumn({ type: 'uuid', primary: false })
  user_id: string;

  @PrimaryColumn({ type: 'integer', primary: false })
  achievement_id: number;

  @ManyToOne(() => AchievementEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'achievement_id',
    referencedColumnName: 'id',
  })
  achievement: AchievementEntity;

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

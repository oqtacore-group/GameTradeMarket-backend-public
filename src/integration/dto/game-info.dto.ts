import { ApiProperty } from '@nestjs/swagger';
import { GameInfoScoreDto } from './game-info-score.dto';
import { GameInfoAchievementDto } from './game-info-achievement.dto';
import { GameInfoSocialDto } from './game-info-social.dto';
import { GameInfoDurationDto } from './game-info-duration.dto';

export class GameInfoDto {
  @ApiProperty({ description: 'External link' })
  external_link: string;

  @ApiProperty({ description: 'Social links' })
  social_links: GameInfoSocialDto[];

  @ApiProperty({ description: 'Duration in game' })
  duration: GameInfoDurationDto;

  @ApiProperty({ description: 'Achievement info' })
  achievement: GameInfoAchievementDto;

  @ApiProperty({ description: 'Score info' })
  score: GameInfoScoreDto;
}

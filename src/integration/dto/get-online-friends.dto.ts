import { ApiProperty } from '@nestjs/swagger';
import { AchievementDto } from '../../achievement/dto';

export class GetOnlineFriendsDto {
  @ApiProperty({ description: 'User id' })
  id: string;
  @ApiProperty({ description: 'Nickname' })
  nickname: string;
  @ApiProperty({ description: 'Avatar URL' })
  avatar: string;
  @ApiProperty({ description: 'Game duration in minutes' })
  play_duration: number;
  @ApiProperty({ description: 'Game achievements' })
  achievements: AchievementDto[];
}

import { ApiProperty } from '@nestjs/swagger';

export class GameInfoAchievementDto {
  @ApiProperty({ description: 'Achievement current count' })
  current: number;

  @ApiProperty({ description: 'Achievement total count' })
  total: number;

  @ApiProperty({ description: 'Achievement current count in percent' })
  current_percent: number;
}

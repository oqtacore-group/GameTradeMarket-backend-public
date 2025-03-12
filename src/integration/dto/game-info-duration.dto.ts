import { ApiProperty } from '@nestjs/swagger';

export class GameInfoDurationDto {
  @ApiProperty({ description: 'Duration in game for 2 week' })
  week_2: number;
}

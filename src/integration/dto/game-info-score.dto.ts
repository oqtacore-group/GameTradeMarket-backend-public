import { ApiProperty } from '@nestjs/swagger';

export class GameInfoScoreDto {
  @ApiProperty({ description: 'Current score' })
  current: number;

  @ApiProperty({ description: 'Quantity score by game' })
  quantity: number;

  @ApiProperty({ description: 'Total score' })
  total: number;
}

import { ApiProperty } from '@nestjs/swagger';

export class GetPingActiveGameDto {
  @ApiProperty({ description: 'Duration' })
  total_time_min: number;
}

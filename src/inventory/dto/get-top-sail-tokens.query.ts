import { IsInt, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class GetTopSailTokensQuery {
  @IsString()
  @ApiProperty({ description: 'Game code', required: true })
  gameCode: string;

  @IsInt()
  @Min(5)
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ description: 'Limit record', required: false })
  limit: number;

  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ description: 'Offset record', required: false })
  offset: number;
}

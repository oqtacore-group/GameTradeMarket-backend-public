import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetBlogsQuery {
  @IsString()
  @ApiProperty({ description: 'Game code', required: true })
  gameCode: string;
}

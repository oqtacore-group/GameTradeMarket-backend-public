import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendTextMessageBody {
  @IsUUID(4)
  @ApiProperty({ description: 'Friend id', required: true })
  friendId: string;

  @IsString()
  @ApiProperty({ description: 'Message', required: true })
  message: string;
}

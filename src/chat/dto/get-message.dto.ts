import { ApiProperty } from '@nestjs/swagger';

export class GetMessageDto {
  @ApiProperty({ description: 'Id', required: true })
  id: number;
  @ApiProperty({ description: 'Author', required: true })
  author: string;
  @ApiProperty({ description: 'Recipient', required: true })
  to: string;
  @ApiProperty({ description: 'Avatar URL', required: true })
  avatar: string;
  @ApiProperty({ description: 'State', required: true })
  state: {
    is_media: boolean;
    is_read: boolean;
  };
  @ApiProperty({ description: 'Message', required: true })
  context: string;
  @ApiProperty({ description: 'Create time', required: true })
  create_time: Date;
}

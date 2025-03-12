import { GetMessagesEdgesDto } from './get-messages-edges.dto';
import { PageInfo } from '../../utils/interfaces/utils.interface';
import { ApiProperty } from '@nestjs/swagger';

export class GetMessagesDto {
  @ApiProperty({ description: 'Total message', required: true })
  totalCount: number;
  @ApiProperty({ description: 'Unread count message', required: true })
  unreadCount: number;
  @ApiProperty({ description: 'Edges', required: true })
  edges: GetMessagesEdgesDto;
  @ApiProperty({ description: 'Page info', required: true })
  pageInfo: PageInfo;
}

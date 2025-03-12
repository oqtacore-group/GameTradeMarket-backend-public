import { GetMessageDto } from './get-message.dto';
import { ApiProperty } from '@nestjs/swagger';

export class GetMessagesEdgesDto {
  @ApiProperty({ description: 'Node', type: [GetMessageDto], required: true })
  node: GetMessageDto[];
}

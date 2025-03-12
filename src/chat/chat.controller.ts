import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { OverlayJwtGuard, UserId } from '../auth/auth.guard';
import {
  GetMessageDto,
  GetMessagesDto,
  GetMessagesQuery,
  SendTextMessageBody,
} from './dto';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@UsePipes(new ValidationPipe({ transform: true }))
@Controller('overlay/chat')
@ApiTags('Overlay chat')
export class ChatController {
  constructor(private charService: ChatService) {}

  @UseGuards(OverlayJwtGuard)
  @Get('/messages')
  @ApiOperation({ summary: 'Get messages' })
  @ApiUnauthorizedResponse()
  @ApiOkResponse({
    description: 'Get messages',
    type: GetMessagesDto,
  })
  handlerGetMessages(
    @UserId() userId: string,
    @Query() query: GetMessagesQuery,
  ): Promise<GetMessagesDto> {
    return this.charService.getMessages(
      userId,
      query.friendId,
      query.offset,
      query.limit,
    );
  }

  @UseGuards(OverlayJwtGuard)
  @Post('/message')
  @ApiOperation({ summary: 'Create message' })
  @ApiUnauthorizedResponse()
  @ApiOkResponse({
    description: 'New message',
    type: GetMessageDto,
  })
  @ApiBody({ type: SendTextMessageBody })
  handlerSendTextMessage(
    @UserId() userId: string,
    @Body() body: SendTextMessageBody,
  ): Promise<GetMessageDto> {
    return this.charService.textSend(userId, body.friendId, body.message);
  }
}

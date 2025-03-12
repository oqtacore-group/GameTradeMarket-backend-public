import { InventoryService } from './inventory.service';
import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { GetTopSailTokensQuery } from './dto';
import { CardConnection } from './interfaces/card.interface';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@UsePipes(new ValidationPipe({ transform: true }))
@Controller('overlay/token')
@ApiTags('Overlay token')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get('/top-sail')
  @ApiOperation({ summary: 'Get top sail' })
  @ApiOkResponse({
    description: 'Get top sail',
    type: CardConnection,
  })
  handlerGetTopSailTokens(
    @Query() query: GetTopSailTokensQuery,
  ): Promise<CardConnection> {
    return this.inventoryService.getTopSailTokens(query);
  }
}

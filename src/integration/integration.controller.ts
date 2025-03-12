import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Delete,
  Headers,
  Query,
  UsePipes,
  ValidationPipe,
  HttpCode,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiKeyGuardHttp,
  OverlayJwtGuard,
  PlayerTokenGuard,
  UserId,
} from '../auth/auth.guard';
import { IntegrationService } from './integration.service';
import {
  CreateUserDto,
  GetGameItemEdges,
  ImportContractDto,
  ImportItemDto,
} from './dto/integration.dto';
import {
  CreateUserInput,
  DeleteGameItemInput,
  GetGameItemsInput,
  ImportContractInput,
  ImportTokenInput,
  PingActiveGameInput,
} from './interfaces/integration.input';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GetOnlineFriendsDto } from './dto/get-online-friends.dto';
import { isInt, isString } from 'class-validator';
import { Token } from '../auth/dto/token.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AccessKeysGamesEntity } from '../account/models/access-keys-games.entity';
import { Repository } from 'typeorm';
import { PlayerWalletDto } from './dto/player-wallet.dto';
import { GetPingActiveGameDto } from './dto/get-ping-active-game.dto';
import { AchievementDto } from '../achievement/dto';
import { GameInfoDto } from './dto/game-info.dto';

@UsePipes(new ValidationPipe({ transform: true }))
@ApiSecurity('apiKey')
@Controller('/')
export class IntegrationController {
  constructor(
    @InjectRepository(AccessKeysGamesEntity)
    private readonly accessKeysGamesRepository: Repository<AccessKeysGamesEntity>,
    private integrationService: IntegrationService,
  ) {}

  @UseGuards(ApiKeyGuardHttp)
  @ApiTags('Items')
  @Post('/items')
  @HttpCode(201)
  @ApiUnauthorizedResponse()
  @ApiOperation({ summary: 'Create token' })
  @ApiCreatedResponse({
    description: 'The token record',
    type: ImportItemDto,
  })
  @ApiBody({ type: ImportTokenInput })
  createItem(
    @Body() params: ImportTokenInput,
    @UserId() user_id: string,
  ): Promise<ImportItemDto> {
    return this.integrationService.importItem(params, user_id);
  }

  @UseGuards(ApiKeyGuardHttp)
  @ApiTags('Items')
  @Get('/items')
  @HttpCode(200)
  @ApiUnauthorizedResponse()
  @ApiOperation({ summary: 'Get all game token' })
  @ApiQuery({ type: GetGameItemsInput })
  @ApiResponse({
    description: 'All game tokens',
    type: GetGameItemEdges,
  })
  getItems(@Query() query: GetGameItemsInput): Promise<GetGameItemEdges> {
    return this.integrationService.getItems(query);
  }

  @UseGuards(ApiKeyGuardHttp)
  @ApiTags('Items')
  @Delete('/items')
  @HttpCode(204)
  @ApiUnauthorizedResponse()
  @ApiNoContentResponse({
    description: 'The token deleted',
  })
  @ApiOperation({ summary: 'Delete token' })
  deleteItem(
    @Body() params: DeleteGameItemInput,
    @UserId() user_id: string,
  ): Promise<boolean> {
    return this.integrationService.deleteItem(params, user_id);
  }

  @UseGuards(OverlayJwtGuard)
  @ApiTags('Overlay')
  @Get('/overlay/player-wallets')
  @HttpCode(200)
  @ApiUnauthorizedResponse()
  @ApiOperation({ summary: 'Get all player wallets' })
  @ApiOkResponse({
    description: 'All player wallets',
    type: [PlayerWalletDto],
  })
  async getPlayerWallets(
    @UserId() user_id: string,
  ): Promise<PlayerWalletDto[]> {
    return this.integrationService.getPlayerWallets(user_id);
  }

  @UseGuards(OverlayJwtGuard)
  @ApiTags('Overlay')
  @Post('/overlay/ping-active-game')
  @HttpCode(200)
  @ApiUnauthorizedResponse()
  @ApiBody({ type: PingActiveGameInput })
  @ApiOperation({ summary: 'Update ping active game' })
  @ApiOkResponse({
    description: 'Update ping',
  })
  async pingActiveGame(
    @UserId() user_id: string,
    @Body() body: PingActiveGameInput,
  ): Promise<void> {
    return this.integrationService.pingActiveGame(body, user_id);
  }

  @UseGuards(OverlayJwtGuard)
  @ApiTags('Overlay')
  @Get('/overlay/game-info')
  @HttpCode(200)
  @ApiUnauthorizedResponse()
  @ApiBody({ type: GameInfoDto })
  @ApiOperation({ summary: 'Game info' })
  @ApiOkResponse({
    description: 'Game info',
  })
  async getGameInfo(
    @UserId() user_id: string,
    @Query('game_code') game_code: string,
  ): Promise<GameInfoDto> {
    if (!isString(game_code)) {
      throw new BadRequestException('Game code invalid');
    }

    return this.integrationService.getGameInfo(game_code, user_id);
  }

  @UseGuards(OverlayJwtGuard)
  @ApiTags('Overlay')
  @Get('/overlay/ping-active-game')
  @HttpCode(200)
  @ApiUnauthorizedResponse()
  @ApiOperation({ summary: 'Get ping active game' })
  @ApiOkResponse({
    description: 'get active game',
    type: GetPingActiveGameDto,
  })
  async getPingActiveGame(
    @UserId() user_id: string,
    @Query('game_code') game_code: string,
  ): Promise<GetPingActiveGameDto> {
    if (!isString(game_code)) {
      throw new BadRequestException('Game code invalid');
    }
    return this.integrationService.getPingActiveGame(game_code, user_id);
  }

  @UseGuards(OverlayJwtGuard)
  @ApiTags('Overlay')
  @Get('/overlay/online-friends')
  @HttpCode(200)
  @ApiUnauthorizedResponse()
  @ApiOperation({ summary: 'Get online friends' })
  @ApiOkResponse({
    description: 'All online friends',
    type: [GetOnlineFriendsDto],
  })
  async getOnlineFriends(
    @UserId() user_id: string,
    @Query('game_code') game_code: string,
  ): Promise<GetOnlineFriendsDto[]> {
    return this.integrationService.getOnlineFriends(user_id, game_code);
  }

  @UseGuards(OverlayJwtGuard)
  @ApiTags('Overlay')
  @Post('/overlay/achievement')
  @HttpCode(200)
  @ApiUnauthorizedResponse()
  @ApiOperation({ summary: 'Add achievement for user' })
  @ApiOkResponse({
    description: 'Add achievement for user',
  })
  async createUserAchievement(
    @UserId() user_id: string,
    @Query('id', ParseIntPipe) id: number,
  ) {
    if (!isInt(id)) {
      throw new BadRequestException('Achievement id invalid');
    }
    return this.integrationService.createUserAchievement(id, user_id);
  }

  @UseGuards(OverlayJwtGuard)
  @ApiTags('Overlay')
  @Get('/overlay/achievement')
  @HttpCode(200)
  @ApiUnauthorizedResponse()
  @ApiOperation({ summary: 'Get achievements of user' })
  @ApiOkResponse({
    description: 'Get achievements of user',
    type: [AchievementDto],
  })
  async getUserAchievements(
    @UserId() user_id: string,
    @Query('game_code') game_code: string,
  ): Promise<AchievementDto[]> {
    return this.integrationService.getUserAchievements(user_id, game_code);
  }

  @ApiTags('Overlay')
  @UseGuards(ApiKeyGuardHttp, PlayerTokenGuard)
  @Post('/overlay/generate-overlay-token')
  @HttpCode(200)
  @ApiOkResponse({
    description: 'JWT token',
    type: Token,
  })
  async generateOverlayToken(
    @UserId() user_id: string,
    @Headers() headers,
    @Query('game_code') game_code: string,
  ): Promise<Token> {
    if (!isString(game_code)) {
      throw new BadRequestException('Game code invalid');
    }
    await this.integrationService.checkAccessKeyByGame(
      game_code,
      headers['x-api-key'],
    );
    return this.integrationService.generateOverlayToken(game_code, user_id);
  }
}

@UseGuards(ApiKeyGuardHttp)
@Controller('/contract')
export class IntegrationContractController {
  constructor(private integrationService: IntegrationService) {}

  @Post('/')
  importContract(
    @Body() params: ImportContractInput,
  ): Promise<ImportContractDto> {
    return this.integrationService.importContract(params);
  }
}

@UseGuards(ApiKeyGuardHttp)
@Controller('/create-user')
export class CreateUserController {
  constructor(private integrationService: IntegrationService) {}

  @Post('/')
  importContract(@Body() params: CreateUserInput): Promise<CreateUserDto> {
    return this.integrationService.createUser(params);
  }
}

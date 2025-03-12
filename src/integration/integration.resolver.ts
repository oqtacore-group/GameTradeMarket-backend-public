import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ApiKeyGuard, ApiKeyGuardHttp, UserId } from '../auth/auth.guard';
import {
  BuyInput,
  DeleteGameItemInput,
  GetGameCardMint,
  GetGameItemsInput,
  ImportTokenInput,
  UpdatePriceInput,
} from './interfaces/integration.input';
import { IntegrationService } from './integration.service';
import {
  GameCardMint,
  GetGameItemDto,
  GetGameItemEdges,
  ImportItemDto,
} from './dto/integration.dto';
import { GetGamesWithNotExistsTokenDto } from './dto/get-games-with-not-exists-token.dto';
import { BlogEntity } from '../blog/models/blog.entity';
import { CreateBlogParams } from '../blog/blog.interface';

@UseGuards(ApiKeyGuardHttp)
@Resolver()
export class IntegrationResolver {
  constructor(private integrationService: IntegrationService) {}

  @Mutation(() => ImportItemDto)
  importItem(
    @Args('params') params: ImportTokenInput,
    @UserId() user_id: string,
  ): Promise<ImportItemDto> {
    return this.integrationService.importItem(params, user_id);
  }

  @Query(() => GetGameItemDto)
  getGameItems(
    @Args('params', { nullable: true }) params: GetGameItemsInput,
  ): Promise<GetGameItemEdges> {
    return this.integrationService.getItems(params);
  }

  @Mutation(() => Boolean)
  deleteGameitem(
    @Args('params') params: DeleteGameItemInput,
    @UserId() user_id: string,
  ): Promise<boolean> {
    return this.integrationService.deleteItem(params, user_id);
  }

  @Query(() => [String])
  getBlogsUrls(): Promise<string[]> {
    return this.integrationService.getBlogsUrls();
  }

  @Mutation(() => Boolean)
  updatePrice(@Args('params') params: UpdatePriceInput) {
    return this.integrationService.updatePrice(params);
  }

  @Mutation(() => Boolean)
  buy(@Args('params') params: BuyInput) {
    return this.integrationService.buy(params);
  }

  @Query(() => [GetGamesWithNotExistsTokenDto])
  getGamesWithNotExistsTokens() {
    return this.integrationService.getGamesWithNotExistsTokens();
  }

  @Mutation(() => BlogEntity)
  @UseGuards(ApiKeyGuard)
  importBlog(@Args('params') params: CreateBlogParams) {
    return this.integrationService.importBlog(params);
  }
}

@Resolver()
export class MintingResolver {
  constructor(private readonly integrationService: IntegrationService) {}

  @Query(() => GameCardMint)
  gameCardMint(@Args('params') params: GetGameCardMint): Promise<GameCardMint> {
    return this.integrationService.getGameCardMint(params);
  }

  @Query(() => [GameCardMint])
  gameCardsMint(): Promise<GameCardMint[]> {
    return this.integrationService.getGameCardsMint();
  }
}

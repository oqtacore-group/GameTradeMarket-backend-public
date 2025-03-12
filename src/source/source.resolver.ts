import {
  Args,
  Float,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { SourceService } from './source.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard, CurrentUser, UserGuard } from '../auth/auth.guard';
import { RoleGuard } from '../role/role.guard';
import { Success } from '../utils/interfaces/response.interface';
import { CurrentUserRoles, RoleEnum } from '../role/role.decorator';
import {
  Game,
  GameConnection,
  CountGames,
  GameCardContract,
  GameFilter,
  Genre,
  MediaLink,
} from './dto/source.dto';
import { PublisherUsers } from './dto/source-user.dto';
import {
  AddSourceInput,
  GameCardParams,
  RemoveSourceInput,
  UpdateSourceInput,
  ContractsListParams,
  GamesParams,
  CatalogGameParams,
} from './interfaces/source.input';
import {
  AddPublisherOfSourceInput,
  RemovePublisherOfSourceInput,
  PublisherUsersParams,
} from './interfaces/source-user.input';
import { InventoryService } from '../inventory/inventory.service';
import { ContractEntity } from '../inventory/models/contract.entity';
import { GetAllReviewParams } from '../review/review.interface';
import { ReviewService } from '../review/review.service';
import { ReviewEntity } from '../review/models/review.entity';
import { BlogEntity } from '../blog/models/blog.entity';
import { GetAllBlogParams } from '../blog/blog.interface';
import { BlogService } from '../blog/blog.service';
import { IUser } from '../auth/interfaces/user.interface';
import { ContractRemoveInput } from './dto/contract-remove.input';
import { ContractCreateInput } from './dto/contract-create.input';
import { CatalogGameConnection } from './dto/catalog-game-connection.dto';
import { GameCard } from './dto/game-card.dto';
import { GameCurrency } from './dto/source-currency.dto';
import { MarketBlog } from '../blog/dto/market-blog.dto';
import { CatalogGameStats } from './dto/catalog-game-stats.dto';

@UseGuards(AuthGuard, RoleGuard)
@Resolver(() => Game)
export class SourceResolver {
  constructor(
    private readonly sourceService: SourceService,
    private readonly inventoryService: InventoryService,
  ) {}

  @Query(() => [PublisherUsers], { nullable: true, description: '' })
  publisherUsers(
    @Args('params', { nullable: true }) params: PublisherUsersParams,
  ) {
    return this.sourceService.getPublisherUsers(params);
  }

  @Query(() => [ContractEntity], { nullable: true, description: '' })
  getContracts(
    @Args('params', { nullable: true }) params: ContractsListParams,
  ) {
    return this.sourceService.getContracts(params);
  }

  @Mutation(() => Success, { description: 'Add contract for game' })
  @CurrentUserRoles(RoleEnum.ADMIN)
  addContract(@Args('params') params: ContractCreateInput) {
    return this.sourceService.addContract(params);
  }

  @Mutation(() => Success, { description: 'Remove contract from game' })
  @CurrentUserRoles(RoleEnum.ADMIN)
  removeContract(@Args('params') params: ContractRemoveInput) {
    return this.sourceService.removeContract(params);
  }

  @Mutation(() => Success, { description: 'Add game' })
  @CurrentUserRoles(RoleEnum.ADMIN)
  addSource(
    @CurrentUser() user: IUser,
    @Args('params') params: AddSourceInput,
  ) {
    return this.sourceService.addSource(params, user.sub);
  }

  @Mutation(() => Success, { description: 'Update game' })
  @CurrentUserRoles(RoleEnum.ADMIN)
  updateSource(
    @CurrentUser() user: IUser,
    @Args('params') params: UpdateSourceInput,
  ) {
    return this.sourceService.updateSource(params, user.sub);
  }

  @Mutation(() => Success, { description: 'Delete game' })
  @CurrentUserRoles(RoleEnum.ADMIN)
  removeSource(@Args('params') params: RemoveSourceInput) {
    return this.sourceService.removeSource(params);
  }

  @Mutation(() => Success, { description: 'Add game publisher' })
  @CurrentUserRoles(RoleEnum.ADMIN)
  addPublisherSource(@Args('params') params: AddPublisherOfSourceInput) {
    return this.sourceService.addPublishUser(params);
  }

  @Mutation(() => Success, { description: 'Remove game publisher' })
  @CurrentUserRoles(RoleEnum.ADMIN)
  removePublisherSource(@Args('params') params: RemovePublisherOfSourceInput) {
    return this.sourceService.removePublishUser(params);
  }

  @ResolveField(() => Int, { nullable: true })
  itemOnSaleCount(@Parent() source: Game) {
    return this.inventoryService.getItemsOnSaleCountWithContractsByGameCode(
      source.code,
    );
  }

  @ResolveField(() => [ContractEntity], { nullable: true })
  contracts(@Parent() source: Game) {
    return this.inventoryService.contractService.getContractsBySource(
      source.code,
    );
  }

  @ResolveField(() => Int, { nullable: true })
  itemCount(@Parent() source: Game) {
    return this.inventoryService.getItemsCountWithContractsByGameCode(
      source.code,
    );
  }
}

@Resolver(() => Game)
export class SourceNotAuthResolver {
  constructor(
    private readonly sourceService: SourceService,
    private readonly reviewService: ReviewService,
    private readonly blogService: BlogService,
  ) {}

  @Query(() => [GameFilter], { nullable: true })
  gameFilters(): Promise<GameFilter[]> {
    return this.sourceService.getFilters();
  }

  @Query(() => GameConnection, { nullable: true })
  games(
    @Args('params', { nullable: true }) params: GamesParams,
  ): Promise<GameConnection> {
    return this.sourceService.getFilterMarketGames(params);
  }

  @Query(() => CountGames)
  async gamesCount(): Promise<CountGames> {
    const total = await this.sourceService.getGamesCount();
    return { total };
  }

  @Query(() => GameCard, { nullable: true })
  gameCard(@Args('params') params: GameCardParams): Promise<GameCard> {
    return this.sourceService.getGameCard(params);
  }

  @Query(() => [ReviewEntity], { nullable: true })
  getReviews(
    @Args('params') params: GetAllReviewParams,
  ): Promise<ReviewEntity[]> {
    return this.reviewService.getAll(params, true);
  }

  @Query(() => [BlogEntity], { nullable: true })
  getBlogs(@Args('params') params: GetAllBlogParams): Promise<BlogEntity[]> {
    return this.blogService.getAll(params);
  }

  @Query(() => [MarketBlog], { nullable: true })
  getMarketBlogs(): Promise<MarketBlog[]> {
    return this.blogService.getMarketBlogs();
  }

  @Query(() => CatalogGameConnection)
  @UseGuards(UserGuard)
  catalogGames(
    @Args('params') params: CatalogGameParams,
    @CurrentUser() user?: IUser,
  ): Promise<CatalogGameConnection> {
    return this.sourceService.getCatalog(params, user?.sub);
  }

  @Query(() => CatalogGameConnection)
  catalogLandingGames(
    @Args('params') params: CatalogGameParams,
  ): Promise<CatalogGameConnection> {
    return this.sourceService.getLandingCatalog(params);
  }
}

@Resolver(() => GameCard)
export class GameCardResolver {
  constructor(
    private readonly sourceService: SourceService,
    private readonly inventoryService: InventoryService,
  ) {}

  @ResolveField(() => Int)
  owners() {
    return 100;
  }

  @ResolveField(() => Int)
  items_on_sale(@Parent() card: GameCard) {
    return this.inventoryService.getItemsOnSaleCountWithContractsByGameCode(
      card.code,
    );
  }

  @ResolveField(() => String, { nullable: true })
  floor_price(@Parent() card: GameCard): Promise<string> {
    return this.inventoryService.getFloorPrice(card.code);
  }

  @ResolveField(() => Float)
  rating(@Parent() card: GameCard): Promise<number> {
    return this.sourceService.getRating(card);
  }

  @ResolveField(() => [Genre], { nullable: true })
  genres(@Parent() card: GameCard): Promise<Genre[]> {
    return this.sourceService.getGenres(card);
  }

  @ResolveField(() => [GameCardContract])
  async contracts(@Parent() card: GameCard): Promise<GameCardContract[]> {
    const contracts = await this.sourceService.getContractBySourceCode(
      card.code,
    );
    if (contracts) {
      return contracts.map((contract) => {
        return {
          title: contract.source.name,
          contract_address: contract.contract,
          verify: contract?.source?.is_verify || false,
          link: contract.source.external_link,
          blockchain: contract.blockchain,
        };
      });
    }
  }

  @ResolveField(() => GameCardContract, { nullable: true })
  async first_contract(
    @Parent() card: GameCard,
  ): Promise<GameCardContract | null> {
    const contracts = await this.sourceService.getContractBySourceCode(
      card.code,
    );
    if (contracts && contracts.length > 0) {
      const firstContract = contracts[0];
      return {
        title: firstContract.source.name,
        contract_address: firstContract.contract,
        verify: firstContract?.source?.is_verify || false,
        link: firstContract.source.external_link,
        blockchain: firstContract.blockchain,
      };
    }
    return null;
  }

  @ResolveField(() => [GameCurrency])
  async currencies(@Parent() card: GameCard): Promise<GameCurrency[]> {
    return this.inventoryService.getCurrencies(card.code);
  }

  @ResolveField(() => Int, { defaultValue: 0 })
  async count_review(@Parent() card: GameCard): Promise<number> {
    return this.sourceService.getReviewCount(card);
  }

  @ResolveField(() => [String])
  blockchainNames(@Parent() card: GameCard): Promise<string[]> {
    return this.sourceService.getBlockchainNamesBySource(card);
  }

  @ResolveField(() => MediaLink, { nullable: true })
  first_media_link(@Parent() card: GameCard): MediaLink | null {
    if (card.media_links && card.media_links.length > 0) {
      return card.media_links[0];
    }
    return null;
  }

  @Query(() => CatalogGameStats)
  gameStats(@Args('gameCode') gameCode: string): Promise<CatalogGameStats> {
    return this.sourceService.getGameStats(gameCode);
  }
}

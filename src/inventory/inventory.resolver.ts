import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AddInventoryParams } from './interfaces/add-inventory.input';
import { RemoveInventoryParams } from './interfaces/remove-inventory.input';
import { NotifyInventoryParams } from './interfaces/notify-inventory.input';
import { InventoryService } from './inventory.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard, CurrentUser, UserGuard } from '../auth/auth.guard';
import { IUser } from '../auth/interfaces/user.interface';
import { TokenInfo } from '../blockchain/dto/token-info.dto';
import { TokenInfoParams } from '../blockchain/interfaces/token.input';
import {
  GameTokenFacet,
  GameTokenFacetsParams,
  GameTokenFilter,
} from './interfaces/market.interface';
import {
  Card,
  CardConnection,
  GameCardsParams,
  GameTokenCardParams,
  SimilarCardsParams,
} from './interfaces/card.interface';
import { GameCurrency } from '../source/dto/source-currency.dto';
import { Success } from '../utils/interfaces/response.interface';
import { InventoryEntity } from './models/inventory.entity';
import { TokenTransfer } from './interfaces/token-transfer.interface';
import { CommentService } from './comments/comment.service';
import { CommentsDto } from './comments/interfaces/comment.dto';
import { PaginationParams } from '../utils/interfaces/utils.interface';
import { GameTokenFilterParams } from './interfaces/inventory.input';
import { CurrentUserRoles, RoleEnum } from '../role/role.decorator';
import { SetCoinInfo } from './interfaces/set-coin-info.interface';
import { SetCoinInfoInput } from './interfaces/set-coin-info.input';
import { SlideEntity } from './models/slide.entity';

@Resolver(() => Card)
export class InventoryResolver {
  constructor(
    private inventoryService: InventoryService,
    private commentService: CommentService,
  ) {}

  @Mutation(() => InventoryEntity)
  @UseGuards(AuthGuard)
  addInventoryItem(
    @CurrentUser() owner: IUser,
    @Args('params', { nullable: true })
    { contract, token_value, game_code }: AddInventoryParams,
  ) {
    return this.inventoryService.addInventoryItem(
      owner.sub,
      contract,
      game_code,
      token_value,
    );
  }

  @Mutation(() => Success)
  @UseGuards(AuthGuard)
  removeItemFromInventory(
    @CurrentUser() owner: IUser,
    @Args('params', { nullable: true })
    { contract, token_value }: RemoveInventoryParams,
  ) {
    return this.inventoryService.removeItemFromInventory(
      owner.sub,
      contract,
      token_value,
    );
  }

  @Query(() => TokenInfo, { nullable: true })
  @UseGuards(AuthGuard)
  tokenInfo(@Args('params') params: TokenInfoParams) {
    return this.inventoryService.getTokenInfo(params);
  }

  @Query(() => [TokenTransfer], { nullable: true })
  @UseGuards(AuthGuard)
  getTokens(@Args('address', { type: () => String }) address: string) {
    return this.inventoryService.search([address]);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  itemLike(
    @CurrentUser() { sub }: IUser,
    @Args('item_id', { type: () => Int }) item_id: number,
  ): Promise<boolean> {
    return this.inventoryService.changeItemLike(item_id, sub);
  }

  @Mutation(() => InventoryEntity, { nullable: true })
  refreshInventoryItem(
    @Args('params', { nullable: true })
    { contract, token_value, blockchain }: NotifyInventoryParams,
  ) {
    console.log('check')
    return this.inventoryService.refreshInventoryItem(
      contract,
      token_value,
      blockchain,
    );
  }

  @Mutation(() => Boolean)
  importInventory(@Args('address') address: string) {
    return this.inventoryService.getNFTsByUser(address);
  }

  @Mutation(() => SetCoinInfo, { nullable: true })
  setCoinInfo(@Args('params') params: SetCoinInfoInput) {
    return this.inventoryService.setCoinInfo(params);
  }

  @Query(() => [GameTokenFacet], { nullable: true })
  gameTokenFacets(
    @Args('params', { nullable: true }) params: GameTokenFacetsParams,
  ) {
    return this.inventoryService.getFacets(params);
  }

  @Query(() => CardConnection)
  gameTokenCards(@Args('params', { nullable: true }) params: GameCardsParams) {
    return this.inventoryService.getTokenCards(params);
  }

  @Query(() => Card, { nullable: true })
  gameTokenCard(@Args('params') params: GameTokenCardParams) {
    return this.inventoryService.getTokenCard(params);
  }

  @Query(() => [SlideEntity], { nullable: 'items' })
  homeSlides(): Promise<SlideEntity[]> {
    return this.inventoryService.getSlides();
  }

  @Query(() => CardConnection)
  gameSimilarTokenCards(@Args('params') params: SimilarCardsParams) {
    return this.inventoryService.getSimilarTokenCards(params);
  }

  @Query(() => [GameTokenFilter], { nullable: true })
  gameTokenFilters(
    @Args('params', { nullable: true }) params: GameTokenFilterParams,
  ) {
    return this.inventoryService.getFilters(params);
  }

  @ResolveField(() => Boolean, { name: 'is_my_like', defaultValue: false })
  @UseGuards(UserGuard)
  isMyLike(@Parent() card: Card, @CurrentUser() user?: IUser) {
    if (!user?.sub) return false;
    return this.inventoryService.isItemLike(user.sub, +card.id);
  }

  @ResolveField(() => [GameCurrency])
  async currencies(@Parent() card: Card): Promise<GameCurrency[]> {
    return this.inventoryService.getCurrencies(card.game_code);
  }

  @ResolveField(() => CommentsDto)
  comments(
    @Parent() card: Card,
    @Args('params') params: PaginationParams,
  ): Promise<CommentsDto> {
    return this.commentService.getCommentsByItemId(+card.id, params);
  }

  @ResolveField(() => Int)
  likes_count(@Parent() card: Card): Promise<number> {
    return this.inventoryService.getItemLikesCount(card.id);
  }
}
